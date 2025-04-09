import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance'; // Import your axiosInstance
import NavBar from './NavBar';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('incoming');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axiosInstance.get('/inventory') // Use axiosInstance
      .then(response => {
        const inventoryData = response.data;
        const incomingData = inventoryData.filter(item => item.type === 'incoming');
        const outgoingData = inventoryData.filter(item => item.type === 'outgoing');
        setIncoming(incomingData);
        setOutgoing(outgoingData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching inventory data:', error);
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      });
  };

  const handleDeleteClick = (mainCategoryName, subCategoryName, type) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${subCategoryName}" under "${mainCategoryName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.post('/inventory/delete-subcategory', { // Use axiosInstance
          type,
          mainCategoryName,
          subCategoryName
        })
        .then(response => {
          Swal.fire(
            'Deleted!',
            `"${subCategoryName}" under "${mainCategoryName}" has been deleted.`,
            'success'
          );
          fetchData();
        })
        .catch(error => {
          console.error('Error deleting subcategory:', error);
          Swal.fire(
            'Error!',
            'Failed to delete the subcategory. Please try again later.',
            'error'
          );
        });
      }
    });
  };

  const handleAddMain = (categoryType) => {
    if (categoryType === 'incoming') {
      navigate('/dashboard/addmain?category=incoming');
    } else if (categoryType === 'outgoing') {
      navigate('/dashboard/addmain?category=outgoing');
    }
  };

  const handleAddSubcategory = (mainCategoryName, type) => {
    navigate(`/dashboard/addsub?mainCategoryName=${encodeURIComponent(mainCategoryName)}&type=${encodeURIComponent(type)}`);
  };

  const handleDeleteCategory = (mainCategoryName, type) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${mainCategoryName}" from ${type}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.post('/inventory/delete-main-category', { // Use axiosInstance
          type,
          mainCategoryName
        })
        .then(response => {
          Swal.fire(
            'Deleted!',
            `"${mainCategoryName}" has been deleted.`,
            'success'
          );
          fetchData();
        })
        .catch(error => {
          console.error('Error deleting category:', error);
          Swal.fire(
            'Error!',
            'Failed to delete the category. Please try again later.',
            'error'
          );
        });
      }
    });
  };

  const truncateDetails = (details, maxLength) => {
    return details.length > maxLength ? details.substring(0, maxLength) + '...' : details;
  };

  const reportDownload = (type) => {
    axiosInstance.get(`/reports/${type}`, {
      responseType: 'blob', 
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error downloading report:', error);
        setError('Error downloading report. Please try again later.');
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading inventory data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto p-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={fetchData}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your incoming and outgoing inventory</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'incoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Incoming
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs">
                {incoming.reduce((total, item) => 
                  total + item.categories.reduce((catTotal, category) => 
                    catTotal + category.subcategories.length, 0), 0)}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'outgoing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Outgoing
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs">
                {outgoing.reduce((total, item) => 
                  total + item.categories.reduce((catTotal, category) => 
                    catTotal + category.subcategories.length, 0), 0)}
              </span>
            </button>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button 
            onClick={() => handleAddMain(activeTab)} 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Main Category
          </button>
          <button 
            onClick={() => reportDownload(activeTab)} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download {activeTab === 'incoming' ? 'Incoming' : 'Outgoing'} Report
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {activeTab === 'incoming' ? (
            <div className="p-6">
              {incoming.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No incoming inventory</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding a new main category.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => handleAddMain('incoming')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Main Category
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {incoming.map((item, index) => (
                    <div key={item._id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                      {item.categories.map(category => (
                        <div key={category._id} className="mb-6 last:mb-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                            <div className="mt-2 sm:mt-0 flex space-x-3">
                              <button
                                onClick={() => handleAddSubcategory(category.name, item.type)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add Item
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.name, item.type)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete Category
                              </button>
                            </div>
                          </div>
                          
                          {category.subcategories.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-500">No items in this category yet.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {category.subcategories.map((sub, subIndex) => (
                                    <tr key={sub._id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{truncateDetails(sub.details.join(', '), 50)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sub.price}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                          onClick={() => handleDeleteClick(category.name, sub.name, item.type)}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {outgoing.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No outgoing inventory</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding a new main category.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => handleAddMain('outgoing')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Main Category
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {outgoing.map((item, index) => (
                    <div key={item._id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                      {item.categories.map(category => (
                        <div key={category._id} className="mb-6 last:mb-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                            <div className="mt-2 sm:mt-0 flex space-x-3">
                              <button
                                onClick={() => handleAddSubcategory(category.name, item.type)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add Item
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.name, item.type)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete Category
                              </button>
                            </div>
                          </div>
                          
                          {category.subcategories.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-500">No items in this category yet.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {category.subcategories.map((sub, subIndex) => (
                                    <tr key={sub._id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{truncateDetails(sub.details.join(', '), 50)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sub.price}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                          onClick={() => handleDeleteClick(category.name, sub.name, item.type)}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
