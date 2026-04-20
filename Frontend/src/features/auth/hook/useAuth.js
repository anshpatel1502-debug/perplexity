import { useDispatch } from "react-redux";
import { setUser,setLoading,setError } from "../auth.slice";
import { Register,Login,GetMe } from "../services/auth.api";

export function useAuth(){
  const dispatch = useDispatch()

  async function handleRegister({ username,email,password }){
    try{
      dispatch(setLoading(true))
      const data = await Register({ username,email,password })
    }catch(error){
      dispatch(setError(error.response?.data?.message || "Registration failed"))
    }finally{
      dispatch(setLoading(false))
    }
  }

  async function handleLogin({ email,password }){
    try{
      dispatch(setLoading(true))
      const data = await Login({ email,password })
      dispatch(setUser(data.user))
    }catch(error){
      dispatch(setError(error.response?.data?.message || "Login failed"))
    }finally{
      dispatch(setLoading(false))
    }
  }

  async function handleGetMe(){
    try{
      dispatch(setLoading(true))
      const data = await GetMe()
      dispatch(setUser(data.user))
      console.log("✓ User authenticated:", data.user.username)
    }catch(error){
      console.log("✓ User not authenticated (guest mode)")
      dispatch(setError(error.response?.data?.message || "Failed to fetched user data")) 
    }finally{
      dispatch(setLoading(false))
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe
  }
}