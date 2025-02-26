import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance'; // Import axiosInstance
import NavBar from './NavBar';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        console.log('Subcategory added successfully!');
        // Navigate to dashboard or show success message
        navigate('/dashboard');
      } else {
        console.error('Failed to add subcategory:', response.statusText);
        // Handle error scenarios
      }
    } catch (error) {
      console.error('Error adding subcategory:', error.message);
      // Handle network errors or other exceptions
    }
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-2xl mx-auto mt-6 p-4">
        <h2 className="text-xl font-bold mb-4">Add Subcategory</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-lg font-medium mb-2">Main Category Name: {mainCategoryName}</p>
          <p className="text-lg font-medium mb-4">Type: {type}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700">Subcategory Name</label>
              <input
                type="text"
                id="subCategoryName"
                name="subCategoryName"
                value={formData.subCategoryName}
                onChange={handleChange}
                required
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details</label>
              <textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={3}
                required
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex justify-between">
              <Link to="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                Back
              </Link>
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Add Subcategory
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddSubCat;
