import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance'; // Import axiosInstance
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './NavBar'; // Assuming NavBar is in the same directory

function CompanyDetails() {
  const { _id } = useParams(); // Capture the company ID from the URL
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchCompanyDetails();
  }, [_id]);

  const fetchCompanyDetails = async () => {
    try {
      const response = await axiosInstance.get(`/companies/${_id}`); // Use axiosInstance
      setCompany(response.data);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const handleAddRecord = async () => {
    const { value: record } = await Swal.fire({
      title: 'Add Record',
      html: `
        <div class="flex flex-col space-y-4">
          <input id="invoiceNo" class="swal2-input" placeholder="Invoice Number">
          <input id="containerNo" class="swal2-input" placeholder="Container Number">
          <input id="product" class="swal2-input" placeholder="Product">
          <input id="advance" class="swal2-input" placeholder="Advance">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const invoiceNo = document.getElementById('invoiceNo').value.trim();
        const containerNo = document.getElementById('containerNo').value.trim();
        const product = document.getElementById('product').value.trim();
        const advance = document.getElementById('advance').value.trim();

        if (!invoiceNo || !containerNo || !product) {
          Swal.showValidationMessage('Please fill out all fields');
          return false;
        }

        return { invoiceNo, containerNo, product, advance };
      }
    });

    if (record) {
      try {
        await axiosInstance.post(`/companies/${_id}/records/add`, record); // Use axiosInstance
        await fetchCompanyDetails(); // Refresh the company details after adding
        Swal.fire('Record added!', '', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to add record', 'error');
      }
    }
  };

  const handleUpdateRecord = async (record) => {
    const { value: updatedRecord } = await Swal.fire({
      title: 'Update Record',
      html: `
        <div class="flex flex-col space-y-4">
          <input id="invoiceNo" class="swal2-input" placeholder="Invoice Number" value="${record.invoiceNo}">
          <input id="containerNo" class="swal2-input" placeholder="Container Number" value="${record.containerNo}">
          <input id="product" class="swal2-input" placeholder="Product" value="${record.product}">
          <input id="advance" class="swal2-input" placeholder="Advance" value="${record.advance}">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const invoiceNo = document.getElementById('invoiceNo').value.trim();
        const containerNo = document.getElementById('containerNo').value.trim();
        const product = document.getElementById('product').value.trim();
        const advance = document.getElementById('advance').value.trim();

        if (!invoiceNo || !containerNo || !product) {
          Swal.showValidationMessage('Please fill out all fields');
          return false;
        }

        return { invoiceNo, containerNo, product, advance };
      }
    });

    if (updatedRecord) {
      try {
        await axiosInstance.put(`/companies/${_id}/records/${record._id}`, updatedRecord); // Use axiosInstance
        await fetchCompanyDetails(); // Refresh the company details after updating
        Swal.fire('Record updated!', '', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to update record', 'error');
      }
    }
  };

  if (!company) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <NavBar />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={() => navigate('/companies')}
          >
            Back to Companies
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
            onClick={handleAddRecord}
          >
            Add New Record
          </button>
        </div>
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">{company.name}</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Container No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Advance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {company.records.map(record => (
                <tr key={record._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.invoiceNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.containerNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.product}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.advance}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg transition duration-300 ease-in-out"
                      onClick={() => handleUpdateRecord(record)}
                    >
                      Update Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetails;
