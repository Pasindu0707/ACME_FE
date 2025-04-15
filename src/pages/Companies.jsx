import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';
import Swal from 'sweetalert2';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/companies/names');
      setCompanies(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadCompanies = async () => {
    try {
      const response = await axiosInstance.get('/companies/reports/summary', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      // Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);

      // Trigger print after iframe loads
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };
    } catch (error) {
      console.error('Download error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Print',
        text: error.response?.status === 401
          ? 'You must be logged in to print this report.'
          : 'An error occurred while generating the report.',
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanyClick = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  const handleAddCompany = async () => {
    const { value: companyName } = await Swal.fire({
      title: 'Add Company',
      input: 'text',
      inputLabel: 'Company Name',
      inputPlaceholder: 'Enter company name',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Add Company',
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async (name) => {
        if (!name.trim()) {
          Swal.showValidationMessage('Please enter a company name');
          return false;
        }

        try {
          const response = await axiosInstance.post('/companies/add', { name });
          await fetchCompanies();
          return response.data;
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (companyName) {
      Swal.fire({
        title: 'Company Added!',
        text: 'Company has been successfully added.',
        icon: 'success',
        confirmButtonColor: '#3B82F6'
      });
    }
  };

  const handleDeleteCompany = async (companyId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This company and all its records will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/companies/delete/${companyId}`);
        await fetchCompanies();
        Swal.fire({
          title: 'Deleted!',
          text: 'The company has been deleted.',
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete company. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3B82F6'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading companies...</p>
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
                  onClick={fetchCompanies}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="mt-2 text-gray-600">Manage your company records</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleAddCompany}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Company
              </button>

              <button
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleDownloadCompanies}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download All
              </button>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by company name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {filteredCompanies.length > 0 ? (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {filteredCompanies.map(company => (
                    <li
                      key={company._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleCompanyClick(company._id)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <span className="text-lg font-medium">{company.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                              <p className="text-sm text-gray-500">Click to view company details</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => handleDeleteCompany(company._id)}
                          >
                            <svg className="-ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
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
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Company
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Companies;
