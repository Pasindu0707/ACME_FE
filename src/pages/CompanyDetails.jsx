import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

function CompanyDetails() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyDetails();
  }, [_id]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/companies/${_id}`);
      setCompany(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching company details:', error);
      setError('Failed to load company details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axiosInstance.get(`/companies/reports/details/${_id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile: directly download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.setAttribute('download', `${company.name.replace(/\s+/g, '_')}_details.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // On PC: open in iframe and print
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        };
      }
    } catch (error) {
      console.error('PDF preview error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Print Preview Failed',
        text: 'Could not open the PDF in print preview.',
      });
    }
  };

  const handleAddRecord = async () => {
    const { value: record } = await Swal.fire({
      title: 'Add Record',
      html: `
  <div class="flex flex-col space-y-4">
    <input id="invoiceNo" class="swal2-input" placeholder="Invoice Number">
    <input id="containerNo" class="swal2-input" placeholder="Container Number">
    <input id="product" class="swal2-input" placeholder="Description">
    <input id="payments" class="swal2-input" placeholder="Payments">
    <input id="chequeNumber" class="swal2-input" placeholder="Cheque Number">
    <input id="date" type="date" class="swal2-input" placeholder="Date">
  </div>
`,
      didOpen: () => {
        const paymentsInput = document.getElementById('payments');
        paymentsInput.addEventListener('input', () => {
          let rawValue = paymentsInput.value.replace(/,/g, '');
          if (!isNaN(rawValue) && rawValue !== '') {
            const parts = rawValue.split('.');
            let formatted = Number(parts[0]).toLocaleString();
            if (parts[1] !== undefined) formatted += '.' + parts[1].slice(0, 2);
            paymentsInput.value = formatted;
          }
        });
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Record',
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const invoiceNo = document.getElementById('invoiceNo').value.trim();
        const containerNo = document.getElementById('containerNo').value.trim();
        const product = document.getElementById('product').value.trim();
        const paymentsRaw = document.getElementById('payments').value.trim().replace(/,/g, '');
        const chequeNumber = document.getElementById('chequeNumber').value.trim();
        const date = document.getElementById('date').value;

        if (!invoiceNo || !containerNo || !product) {
          Swal.showValidationMessage('Please fill out all required fields');
          return false;
        }

        return {
          invoiceNo,
          containerNo,
          product,
          advance: paymentsRaw,
          chequeNumber,
          date: date ? new Date(date) : undefined
        };
      }

    });

    if (record) {
      try {
        await axiosInstance.post(`/companies/${_id}/records/add`, record);
        await fetchCompanyDetails();
        Swal.fire({
          title: 'Record Added!',
          text: 'The record has been successfully added.',
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add record. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3B82F6'
        });
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
          <input id="advance" class="swal2-input" placeholder="Advance" value="${Number(record.advance).toLocaleString()}">
          <input id="chequeNumber" class="swal2-input" placeholder="Cheque Number (optional)" value="${record.chequeNumber || ''}">
          <input id="date" type="date" class="swal2-input" value="${record.date ? new Date(record.date).toISOString().split('T')[0] : ''}">
        </div>
      `,
      didOpen: () => {
        const advanceInput = document.getElementById('advance');
        advanceInput.addEventListener('input', () => {
          let rawValue = advanceInput.value.replace(/,/g, '');
          if (!isNaN(rawValue) && rawValue !== '') {
            const parts = rawValue.split('.');
            let formatted = Number(parts[0]).toLocaleString();
            if (parts[1] !== undefined) formatted += '.' + parts[1].slice(0, 2);
            advanceInput.value = formatted;
          }
        });
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Record',
      confirmButtonColor: '#3B82F6',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const invoiceNo = document.getElementById('invoiceNo').value.trim();
        const containerNo = document.getElementById('containerNo').value.trim();
        const product = document.getElementById('product').value.trim();
        const advanceRaw = document.getElementById('advance').value.trim().replace(/,/g, '');
        const chequeNumber = document.getElementById('chequeNumber').value.trim();
        const date = document.getElementById('date').value;
  
        if (!invoiceNo || !containerNo || !product) {
          Swal.showValidationMessage('Please fill out all required fields');
          return false;
        }
  
        return {
          invoiceNo,
          containerNo,
          product,
          advance: advanceRaw,
          chequeNumber,
          date: date ? new Date(date) : undefined
        };
      }
    });
  
    if (updatedRecord) {
      try {
        await axiosInstance.put(`/companies/${_id}/records/${record._id}`, updatedRecord);
        await fetchCompanyDetails();
        Swal.fire({
          title: 'Record Updated!',
          text: 'The record has been successfully updated.',
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update record. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3B82F6'
        });
      }
    }
  };
  


  const handleDeleteRecord = async (recordId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This record will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/companies/${_id}/records/${recordId}`);
        await fetchCompanyDetails();
        Swal.fire({
          title: 'Deleted!',
          text: 'The record has been deleted.',
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete record. Please try again.',
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
            <p className="text-gray-600">Loading company details...</p>
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
                  onClick={fetchCompanyDetails}
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

  if (!company) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="mt-2 text-gray-600">Company Records and Details</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/companies')}
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Companies
              </button>

              <button
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleDownloadPDF}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDF
              </button>

              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleAddRecord}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Record
              </button>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {company.records && company.records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container No</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payments</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {company.records.map(record => (
      <tr key={record._id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {record.date ? new Date(record.date).toISOString().split('T')[0] : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.invoiceNo}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.containerNo}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.product}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {record.advance ? Number(record.advance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.chequeNumber || '-'}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              onClick={() => handleUpdateRecord(record)}
            >
              Edit
            </button>
            <button
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => handleDeleteRecord(record._id)}
            >
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
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No records found. Add a new one to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetails;
