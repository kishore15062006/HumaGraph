import React from 'react'

const Login = () => {
  return (
    <div>
        <form>
            <h1>Login</h1>
            <label htmlFor="Email Address"></label>
            <input type='email' placeholder='patient@example.com' required>
            </input>
            <label htmlFor="Password"></label>
            <input type='password' placeholder='*********' required>
            </input>
            <button>Sign in</button>
        </form>
    </div>
  )
}

export default Login