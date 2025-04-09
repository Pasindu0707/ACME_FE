import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import NavBar from './NavBar';
import Swal from 'sweetalert2';

const AddSubCat = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || '';
  const mainCategoryName = searchParams.get('mainCategoryName') || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subCategoryName: '',
    details: '',
    price: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subCategoryName.trim()) {
      newErrors.subCategoryName = 'Subcategory name is required';
    }
    
    if (!formData.details.trim()) {
      newErrors.details = 'Details are required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    const requestBody = {
      type,
      mainCategoryName,
      subCategoryName: formData.subCategoryName,
      details: formData.details,
      price: formData.price
    };

    try {
      const response = await axiosInstance.post('/inventory/add-subcategory', requestBody);

      if (response.status === 201) {
        Swal.fire({
          title: 'Success!',
          text: 'Subcategory added successfully!',
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
        navigate('/dashboard');
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add subcategory. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3B82F6'
        });
      }
    } catch (error) {
      console.error('Error adding subcategory:', error.message);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Subcategory</h1>
              <p className="mt-2 text-gray-600">Create a new subcategory for your inventory</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Category Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><span className="font-medium">Main Category:</span> {mainCategoryName}</p>
                    <p><span className="font-medium">Type:</span> {type}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700">
                  Subcategory Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="subCategoryName"
                    name="subCategoryName"
                    value={formData.subCategoryName}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.subCategoryName 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter subcategory name"
                  />
                  {errors.subCategoryName && (
                    <p className="mt-1 text-sm text-red-600">{errors.subCategoryName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                  Details
                </label>
                <div className="mt-1">
                  <textarea
                    id="details"
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    rows={4}
                    className={`block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.details 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter details about the subcategory"
                  />
                  {errors.details && (
                    <p className="mt-1 text-sm text-red-600">{errors.details}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-7 rounded-md shadow-sm sm:text-sm ${
                      errors.price 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Add Subcategory
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSubCat;
