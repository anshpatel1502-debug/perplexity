import React from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import { useAuth } from '../features/auth/hook/useAuth'
import { useEffect } from 'react'

const App = () => {
  const auth = useAuth()

  useEffect(()=>{
    auth.handleGetMe() // Check if user is still logged in
  },[])
  return (
    <RouterProvider router={router} />
  )
}

export default App