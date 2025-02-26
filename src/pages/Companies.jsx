import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance'; // Import axiosInstance
import Swal from 'sweetalert2';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/companies/names'); // Use axiosInstance
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
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
      confirmButtonText: 'Add',
      showLoaderOnConfirm: true,
      preConfirm: async (name) => {
        if (!name.trim()) {
          Swal.showValidationMessage('Please enter a company name');
          return false;
        }

        try {
          const response = await axiosInstance.post('/companies/add', {
            name: name
          }); // Use axiosInstance
          await fetchCompanies(); // Refresh the company list after adding
          return response.data;
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (companyName) {
      Swal.fire({
        title: 'Company added!',
        text: `Company has been successfully added.`,
        icon: 'success'
      });
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Companies</h1>
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            className="border border-gray-300 p-3 rounded-lg w-full max-w-xs"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={handleAddCompany}
          >
            Add Company
          </button>
        </div>
        <ul className="list-none p-0">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map(company => (
              <li
                key={company._id}
                className="border-b border-gray-300 py-3 px-4 cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                onClick={() => handleCompanyClick(company._id)}
              >
                {company.name}
              </li>
            ))
          ) : (
            <li className="py-4 text-gray-500">No companies found</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Companies;
