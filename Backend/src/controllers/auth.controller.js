import UserModel from "../models/User.models.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
  const { username, email, password } = req.body;

  const isUserExist = await UserModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isUserExist) {
    return res.status(400).json({
      message: "User already exists with the provided username or email",
      success: false,
      err: "User alredy exists",
    });
  }

  const user = await UserModel.create({ username, email, password });
  console.log("Create user:", user.email);

  const emailVerificationToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  if (!emailVerificationToken) {
    return res.status(500).json({
      message: "Error email verification token",
      success: false,
      err: "Internal Server Error for email verification token",
    });
  }

  try {
    await sendEmail({
      to: user.email,
      subject: "Welcome to Perplexity",
      html: `<p>Hello ${username}!</p>
           <p>Thank you for registering with Perplexity. We're excited to have you on board!</p>
           <p>Please verify your email by clicking the link below:</p>
           <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify email </a>
           <p>If you did not create an accout,please ignore this email.</p>
           <p>Best regards,<br/>The Perplexity Team</p>`,
    });
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email sending failed:", err);
  }

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req,res){
  const {email,password} = req.body

  const user = await UserModel.findOne({ email })
  if(!user){
    return res.status(400).json({
      message : "Invalid email or password",
      success : false,
      err : "User not found"
    })
  }

  const isPasswordMatch = await user.comparePassword(password)
  if(!isPasswordMatch){
    return res.status(400).json({
      message : "Invalid password",
      success : false,
      err : "Incorrect password"
    })
  }

  if(!user.verified){
    return res.status(400).json({
      message : "Please varify your email before login",
      success : false,
      err : "Email not verified"
    })
  }

  const token = jwt.sign(
    {
      id:user._id,
      username:user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn :'7d'
    }
  )

  res.cookie("token", token)

  res.status(200).json({
    message : "Login successfully",
    success : true,
    user : {
      id:user.id,
      username:user.username,
      email:user.email
    }
  })
}

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req,res){
  const userId = req.user.id;

  const user = await UserModel.findById(userId).select("-password");
  if(!user){
    return res.status(400).json({
      message : "User not found",
      success : false,
      err : "User not found"
    })
  }

  res.status(200).json({
    message : "User details fetched successfully",
    success : true,
    user
  })
}

/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */ 
export async function verifyEmail(req,res){   
  const { token } = req.query;
  
  try{
    const decoded  = jwt.verify(token,process.env.JWT_SECRET);

    const user = await UserModel.findOne({ email:decoded.email });
    if(!user){
      return res.status(400).json({
        message : "Invalid token",
        success : false,
        err : "User not found"
      })
    }

    user.verified = true;

    await user.save();

    const html = `
      <h1>Email verified succefully</h1>
      <p>Your email has been verified.You can now log in in to yout account</p>
      <a href="http://localhost:3000/api/auth/login">Go To Login </a>`

      return res.send(html);
  }catch(err){
    return res.status(400).json({
      message : "Invalid or expired token",
      success : false,
      err : err.message 
    })
  }
}