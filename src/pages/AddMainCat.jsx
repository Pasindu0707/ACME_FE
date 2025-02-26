import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import axiosInstance from '../components/axiosInstance'; // Import axiosInstance

const AddMainCat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialType = searchParams.get('category') || 'incoming'; // Default to incoming if not provided
  const [formData, setFormData] = useState({
    type: initialType,
    name: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/inventory/add-main-category', formData);

      if (response.status === 201) {
        console.log(response)
        navigate('/dashboard');
      } else {
        console.error('Failed to add main category:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding main category:', error);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-2xl mx-auto mt-6 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Main Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
              readOnly // Assuming type is from params and shouldn't be editable
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2">
              Back
            </Link>
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Add Main Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMainCat;
