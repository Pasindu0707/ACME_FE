import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import NavBar from './NavBar';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('companies');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/');
        return;
      }

      // Fetch companies
      const companiesResponse = await axiosInstance.get('/company/get-all-companies');
      setCompanies(companiesResponse.data);

      // Fetch inventory
      const inventoryResponse = await axiosInstance.get('/inventory');
      const inventoryData = inventoryResponse.data;
      const outgoingData = inventoryData.filter(item => item.type === 'outgoing');
      setOutgoing(outgoingData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        // Try to refresh token
        try {
          const refreshResponse = await axiosInstance.get('/refresh');
          if (refreshResponse.data?.accessToken) {
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            // Retry the original requests
            const [companiesRetry, inventoryRetry] = await Promise.all([
              axiosInstance.get('/company/get-all-companies'),
              axiosInstance.get('/inventory')
            ]);
            setCompanies(companiesRetry.data);
            const outgoingData = inventoryRetry.data.filter(item => item.type === 'outgoing');
            setOutgoing(outgoingData);
            setLoading(false);
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }

        // If refresh failed or no new token, show session expired
        Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          icon: 'warning',
          confirmButtonColor: '#3B82F6'
        }).then(() => {
          localStorage.removeItem('accessToken');
          navigate('/');
        });
      } else {
        setError(error.response?.data?.message || 'Error fetching data. Please try again later.');
      }
      setLoading(false);
    }
  };
  const downloadCompanyReport = (companyId) => {
    axiosInstance.get(`/company/generate-report/${companyId}`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `company_${companyId}_report.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error downloading company report:', error);
        Swal.fire('Error', 'Failed to download the company report.', 'error');
      });
  };
  
  const downloadFullReport = () => {
    axiosInstance.get('/company/generate-full-report', { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `all_companies_report.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error downloading full report:', error);
        Swal.fire('Error', 'Failed to download the full report.', 'error');
      });
  };
  
  const handleAddCompany = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Company',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input id="companyName" class="swal2-input w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Enter company name">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add Company',
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('companyName').value;

        if (!name) {
          Swal.showValidationMessage('Company name is required');
          return false;
        }

        return { name };
      }
    });

    if (formValues) {
      try {
        await axiosInstance.post('/company/add-company', formValues);
        Swal.fire({
          title: 'Success!',
          text: 'Company added successfully!',
          icon: 'success',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } catch (error) {
        console.error('Error adding company:', error);
        if (error.response?.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            icon: 'warning',
            confirmButtonColor: '#3B82F6'
          }).then(() => {
            navigate('/');
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Failed to add company. Please try again.',
            icon: 'error',
            confirmButtonColor: '#3B82F6'
          });
        }
      }
    }
  };

  const handleDeleteCompany = async (companyName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${companyName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete('/company/delete-company', {
          data: { name: companyName }
        });
        Swal.fire(
          'Deleted!',
          `"${companyName}" has been deleted.`,
          'success'
        );
        fetchData();
      } catch (error) {
        console.error('Error deleting company:', error);
        if (error.response?.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            icon: 'warning',
            confirmButtonColor: '#3B82F6'
          }).then(() => {
            navigate('/');
          });
        } else {
          Swal.fire(
            'Error!',
            error.response?.data?.message || 'Failed to delete the company. Please try again later.',
            'error'
          );
        }
      }
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleAddRecord = async (companyName) => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Record',
      html: `
        <div class="space-y-6 p-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">${companyName}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                  <input id="amount" type="text" class="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" placeholder="0.00">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" placeholder="Enter record description"></textarea>
              </div>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add Record',
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      
      didOpen: () => {
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', (e) => {
          let value = e.target.value.replace(/[^\d.]/g, '');
          if (value) {
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            value = parts.join('.');
            e.target.value = value;
          }
        });
      },
      preConfirm: () => {
        const date = document.getElementById('date').value;
        const amount = document.getElementById('amount').value.replace(/,/g, '');
        const description = document.getElementById('description').value;

        if (!date) {
          Swal.showValidationMessage('Date is required');
          return false;
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
          Swal.showValidationMessage('Please enter a valid amount');
          return false;
        }

        if (!description) {
          Swal.showValidationMessage('Description is required');
          return false;
        }

        return {
          date,
          amount: parseFloat(amount),
          description
        };
      }
    });

    if (formValues) {
      try {
        await axiosInstance.post('/company/add-record', {
          companyName,
          ...formValues
        });
        Swal.fire({
          title: 'Success!',
          text: 'Record added successfully!',
          icon: 'success',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } catch (error) {
        if (error.response?.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            icon: 'warning',
            confirmButtonColor: '#3B82F6'
          }).then(() => {
            navigate('/');
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to add record. Please try again.',
            icon: 'error',
            confirmButtonColor: '#3B82F6'
          });
        }
      }
    }
  };

  const handleEditRecord = async (companyName, record) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Record',
      html: `
        <div class="space-y-6 p-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">${companyName}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" value="${record.date.split('T')[0]}">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                  <input id="amount" type="text" class="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" value="${formatAmount(record.amount)}">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">${record.description}</textarea>
              </div>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Record',
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      didOpen: () => {
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', (e) => {
          let value = e.target.value.replace(/[^\d.]/g, '');
          if (value) {
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            value = parts.join('.');
            e.target.value = value;
          }
        });
      },
      preConfirm: () => {
        const date = document.getElementById('date').value;
        const amount = document.getElementById('amount').value.replace(/,/g, '');
        const description = document.getElementById('description').value;

        if (!date) {
          Swal.showValidationMessage('Date is required');
          return false;
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
          Swal.showValidationMessage('Please enter a valid amount');
          return false;
        }

        if (!description) {
          Swal.showValidationMessage('Description is required');
          return false;
        }

        return {
          date,
          amount: parseFloat(amount),
          description
        };
      }
    });

    if (formValues) {
      try {
        await axiosInstance.put('/company/edit-record', {
          companyName,
          recordId: record._id,
          ...formValues
        });
        Swal.fire({
          title: 'Success!',
          text: 'Record updated successfully!',
          icon: 'success',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } catch (error) {
        if (error.response?.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            icon: 'warning',
            confirmButtonColor: '#3B82F6'
          }).then(() => {
            navigate('/');
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to update record. Please try again.',
            icon: 'error',
            confirmButtonColor: '#3B82F6'
          });
        }
      }
    }
  };

  const handleDeleteRecord = async (companyName, recordId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This record will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete('/company/delete-record', {
          data: { companyName, recordId }
        });
        Swal.fire(
          'Deleted!',
          'Record has been deleted.',
          'success'
        );
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
        if (error.response?.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            icon: 'warning',
            confirmButtonColor: '#3B82F6'
          }).then(() => {
            navigate('/');
          });
        } else {
          Swal.fire(
            'Error!',
            'Failed to delete the record. Please try again later.',
            'error'
          );
        }
      }
    }
  };

  const handleDeleteClick = (mainCategoryName, subCategoryName) => {
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
        axiosInstance.post('/inventory/delete-subcategory', {
          type: 'outgoing',
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
          if (error.response?.status === 401) {
            Swal.fire({
              title: 'Session Expired',
              text: 'Please log in again to continue.',
              icon: 'warning',
              confirmButtonText: 'OK'
            }).then(() => {
              navigate('/login');
            });
          } else {
            console.error('Error deleting subcategory:', error);
            Swal.fire(
              'Error!',
              'Failed to delete the subcategory. Please try again later.',
              'error'
            );
          }
        });
      }
    });
  };

  const handleAddMain = () => {
    navigate('/dashboard/addmain?category=outgoing');
  };

  const handleAddSubcategory = (mainCategoryName) => {
    navigate(`/dashboard/addsub?mainCategoryName=${encodeURIComponent(mainCategoryName)}&type=outgoing`);
  };

  const handleDeleteCategory = (mainCategoryName) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${mainCategoryName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.post('/inventory/delete-main-category', {
          type: 'outgoing',
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
          if (error.response?.status === 401) {
            Swal.fire({
              title: 'Session Expired',
              text: 'Please log in again to continue.',
              icon: 'warning',
              confirmButtonText: 'OK'
            }).then(() => {
              navigate('/login');
            });
          } else {
            console.error('Error deleting category:', error);
            Swal.fire(
              'Error!',
              'Failed to delete the category. Please try again later.',
              'error'
            );
          }
        });
      }
    });
  };

  const truncateDetails = (details, maxLength) => {
    return details.length > maxLength ? details.substring(0, maxLength) + '...' : details;
  };

  const reportDownload = () => {
    axiosInstance.get('/reports/outgoing', {
      responseType: 'blob',
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'outgoing.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        if (error.response?.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Please log in again to continue.',
            icon: 'warning',
            confirmButtonText: 'OK'
          }).then(() => {
            navigate('/login');
          });
        } else {
          console.error('Error downloading report:', error);
          setError('Error downloading report. Please try again later.');
        }
        setLoading(false);
      });
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update the styles section
  const styles = `
    .swal-wide {
      width: 500px !important;
    }
    .swal2-popup {
      padding: 0 !important;
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      margin: 0 !important;
      border-radius: 1rem !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      z-index: 9999 !important;
      background: white !important;
    }
    .swal2-content {
      padding: 0 !important;
    }
    .swal2-container {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      background-color: rgba(0, 0, 0, 0.6) !important;
      z-index: 9998 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .swal2-backdrop-show {
      background: rgba(0, 0, 0, 0.6) !important;
    }
    .swal2-title {
      padding: 1.5rem 1.5rem 0.5rem !important;
      font-size: 1.5rem !important;
      font-weight: 600 !important;
      color: #111827 !important;
      margin: 0 !important;
    }
    .swal2-actions {
      padding: 1rem 1.5rem 1.5rem !important;
      gap: 0.75rem !important;
      margin: 0 !important;
    }
    .swal2-confirm {
      background-color: #3B82F6 !important;
      font-weight: 500 !important;
      padding: 0.625rem 1.25rem !important;
      border-radius: 0.5rem !important;
      transition: all 0.2s !important;
    }
    .swal2-confirm:hover {
      background-color: #2563EB !important;
      transform: translateY(-1px) !important;
    }
    .swal2-cancel {
      background-color: #F3F4F6 !important;
      color: #374151 !important;
      font-weight: 500 !important;
      padding: 0.625rem 1.25rem !important;
      border-radius: 0.5rem !important;
      transition: all 0.2s !important;
    }
    .swal2-cancel:hover {
      background-color: #E5E7EB !important;
      transform: translateY(-1px) !important;
    }
    .swal2-validation-message {
      background-color: #FEE2E2 !important;
      color: #DC2626 !important;
      border-radius: 0.5rem !important;
      padding: 0.75rem !important;
      margin: 0.5rem 1.5rem !important;
      font-size: 0.875rem !important;
    }
    .swal2-shown {
      overflow: hidden !important;
    }
    .swal2-close {
      display: none !important;
    }
  `;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
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
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto p-4 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your companies and inventory</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <button
                  onClick={() => setActiveSection('companies')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeSection === 'companies'
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Companies
                </button>
                <button
                  onClick={() => setActiveSection('outgoing')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeSection === 'outgoing'
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Outgoing Inventory
                </button>
              </div>
            </div>
          </div>

          {activeSection === 'companies' ? (
            // Companies Section
            <div>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
  onClick={downloadFullReport}
  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
>
  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
  Download Full PDF
</button>

                <button 
                  onClick={handleAddCompany}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Company
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'No companies match your search criteria.' : 'Get started by adding a new company.'}
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={handleAddCompany}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Company
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <div key={company._id} className="p-6 hover:bg-gray-50 transition-all duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">Total Records: {company.records?.length || 0}</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                          <button
  onClick={() => downloadCompanyReport(company._id)}
  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
>
  <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
  Download PDF
</button>

                            <button
                              onClick={() => handleAddRecord(company.name)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                            >
                              <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Add Record
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(company.name)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                            >
                              <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete Company
                            </button>
                          </div>
                        </div>
                        
                        {company.records && company.records.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {company.records.map((record) => (
                                  <tr key={record._id} className="hover:bg-gray-50 transition-all duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      ${formatAmount(record.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                      {record.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex space-x-3">
                                        <button
                                          onClick={() => handleEditRecord(company.name, record)}
                                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                        >
                                          <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                          </svg>
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteRecord(company.name, record._id)}
                                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                        >
                                          <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-500">No records for this company yet.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Outgoing Inventory Section
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <button 
                  onClick={handleAddMain}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Main Category
                </button>
                <button 
                  onClick={reportDownload}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Outgoing Report
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                          onClick={handleAddMain}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
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
                      {outgoing.map((item) => (
                        <div key={item._id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                          {item.categories.map(category => (
                            <div key={category._id} className="mb-6 last:mb-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                                <div className="flex flex-wrap gap-3">
                                  <button
                                    onClick={() => handleAddSubcategory(category.name)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                  >
                                    <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add Item
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(category.name)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
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
                                      {category.subcategories.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-gray-50 transition-all duration-200">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{truncateDetails(sub.details.join(', '), 50)}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatAmount(sub.price)}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                              onClick={() => handleDeleteClick(category.name, sub.name)}
                                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                            >
                                              <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                              </svg>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
