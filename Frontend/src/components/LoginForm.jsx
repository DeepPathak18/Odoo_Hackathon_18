"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
        navigate("/home")
      } else {
        console.error("Login failed:", data.msg)
      }
    } catch (error) {
      console.error("An error occurred during login:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[450px]">
          {/* Left Side - Decorative Content */}
          <div className="md:w-1/2  relative overflow-hidden md:p-6 flex flex-col justify-center items-center">
            <img
              src="/undraw_login_weas.png"
              alt="Login Illustration"
              className="w-full h-auto max-w-md"
            />
          </div>

          {/* Right Side - Signup Form */}
          <div className="md:w-1/2 p-4 md:p-6 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Header */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-600 mb-1">StackIt</div>
                <div className="text-blue-600 text-xs mb-3">
                  <a href="#" className="hover:underline">
                    Create an Account
                  </a>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight">
                  WELCOME TO
                  <br />
                  StackIt
                </h1>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                >
                  Continue
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center text-xs">
                <span className="text-gray-600">Don't have an account? </span>
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}