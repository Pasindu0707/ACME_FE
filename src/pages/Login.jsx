import React, { useState, useContext } from 'react';
import axiosInstance from '../components/axiosInstance'; // Import the Axios instance
import Logo from '../assets/ACME_LOGO.png';
import AuthContext from '../components/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post('/auth', { user: username, pwd: password }, { withCredentials: true });
      const { accessToken } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('accessToken', accessToken);
      
      // Call login function from context
      login(accessToken);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.Message || 'An error occurred. Please try again.');
      } else if (err.request) {
        setError('Network error. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex-col justify-center items-center text-white">
        <div className="max-w-md">
          <img src={Logo} alt="Logo" className="w-40 h-auto mb-8" />
          <h1 className="text-4xl font-bold mb-4">Welcome to ACME</h1>
          <p className="text-xl mb-8 text-blue-100">
            Your secure workspace for collaboration and productivity.
          </p>
          {/* <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <p className="text-sm text-blue-100">
              "ACME has transformed how our team collaborates. The intuitive interface and powerful features have significantly improved our workflow."
            </p>
            <div className="mt-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-300 mr-3"></div>
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-xs text-blue-200">Product Manager</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-8">
            <img src={Logo} alt="Logo" className="mx-auto w-24 h-auto" />
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-600 mb-6">
              Enter your credentials to access your workspace
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {/* <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div> */}
                {/* <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Forgot password?
                </a> */}
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <a href="#" className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">Contact your administrator</a>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Login;