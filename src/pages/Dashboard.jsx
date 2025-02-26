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
      <div>
        <NavBar />
        <div className="container mx-auto p-4 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto p-4 text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-bold mb-4">Incoming</h2>
            <button onClick={() => handleAddMain('incoming')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">Add Main Category</button>
            {incoming.map((item, index) => (
              <div key={item._id} className="mb-8">
                {item.categories.map(category => (
                  <div key={category._id} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-medium">{category.name}</h4>
                      <div>
                        <button
                          onClick={() => handleAddSubcategory(category.name, item.type)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Add new
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.name, item.type)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete Category
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mt-2">
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
                            <tr key={sub._id}>
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
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => reportDownload('incoming')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-4">Download Incoming</button>
          </div>

          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-bold mb-4">Outgoing</h2>
            <button onClick={() => handleAddMain('outgoing')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">Add Main Category</button>
            {outgoing.map((item, index) => (
              <div key={item._id} className="mb-8">
                {item.categories.map(category => (
                  <div key={category._id} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-medium">{category.name}</h4>
                      <div>
                        <button
                          onClick={() => handleAddSubcategory(category.name, item.type)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Add new
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.name, item.type)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete Category
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mt-2">
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
                            <tr key={sub._id}>
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
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => reportDownload('outgoing')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mt-4">Download Outgoing</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
