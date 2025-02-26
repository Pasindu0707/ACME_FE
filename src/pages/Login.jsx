import React, { useState, useContext } from 'react';
import axiosInstance from '../components/axiosInstance'; // Import the Axios instance
import Logo from '../assets/ACME_LOGO.png';
import AuthContext from '../components/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/auth', { user: username, pwd: password },{ withCredentials: true }); // Use the Axios instance
      const { accessToken } = response.data;
      login(accessToken);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.Message || 'An error occurred. Please try again.');
      } else if (err.request) {
        setError('Network error. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <img src={Logo} alt="Logo" className="mx-auto w-24" />
        </div>
        <p className="text-gray-900 text-center mb-4">
          Continue with your user id you use to sign in<br/>
          and get access to your workspace
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        © 2024 TriniphiX, All rights reserved
      </footer>
    </div>
  );
}

export default Login;
