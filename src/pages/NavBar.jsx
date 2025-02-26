import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/ACME_LOGO.png';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  return (
    <>
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="h-8 inline mr-2" />
          <span className="text-white text-xl font-bold">Inventory Management</span>
        </div>
        <div className="block lg:hidden">
          <button 
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        <ul className="hidden lg:flex lg:space-x-4">
          <li>
            <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
          </li>
          <li>
            <Link to="/companies" className="text-white hover:underline">Companies</Link>
          </li>
          <li>
            <button 
              className="text-white hover:underline"
              onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-800 p-4 z-50 lg:hidden">
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="block text-white hover:underline">Dashboard</Link>
            </li>
            <li>
              <Link to="/companies" className="block text-white hover:underline">Companies</Link>
            </li>
            <li>
              <button 
                className="block text-white hover:underline"
                onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

export default NavBar;
