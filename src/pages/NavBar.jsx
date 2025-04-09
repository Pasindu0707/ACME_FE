import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/ACME_LOGO.png';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-gray-800 py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={Logo} alt="Logo" className={`h-8 w-auto transition-all duration-300 ${
                scrolled ? 'brightness-0 invert' : ''
              }`} />
              <span className={`ml-3 text-xl font-bold transition-colors duration-300 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}>
                Inventory Management
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/dashboard' 
                    ? scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-white' 
                    : scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/companies" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/companies' 
                    ? scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-white' 
                    : scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Companies
              </Link>
              <button 
                onClick={handleLogout}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Logout
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button 
                className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-gray-700'
                }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className={`px-2 pt-2 pb-3 space-y-1 ${
            scrolled ? 'bg-white' : 'bg-gray-800'
          }`}>
            <Link 
              to="/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/dashboard' 
                  ? scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-white' 
                  : scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/companies" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/companies' 
                  ? scrolled ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-white' 
                  : scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Companies
            </Link>
            <button 
              onClick={handleLogout}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default NavBar;
