import axios from "axios";

// console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

// const api = axios.create({
//   baseURL:import.meta.env.VITE_BACKEND_URL,
//   withCredentials:true
// })

const api = axios.create({
  baseURL:import.meta.env.VITE_BACKEND_URL,
  withCredentials:true
})

export async function Register ({ username,email,password }) {
  const response = await api.post("/api/auth/register" , {username,email,password})
  return response.data
}
export async function Login ({ email,password }) {
  const response = await api.post("/api/auth/login" , {email,password})
  return response.data
}
export async function GetMe () {
  const response = await api.get("/api/auth/get-me")
  return response.data
}