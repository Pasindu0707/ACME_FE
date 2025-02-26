// SubcategoryTable.js

import React from 'react';

const SubcategoryTable = ({ categories, handleAddSubcategory, handleDeleteCategory, handleUpdateClick, handleDeleteClick, truncateDetails }) => {
  return (
    <div>
      {categories.map(category => (
        <div key={category._id} className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-medium">{category.name}</h4>
            <div>
              <button
                onClick={() => handleAddSubcategory(category.name)}
                className="text-indigo-600 hover:text-indigo-900 mr-3"
              >
                Add new
              </button>
              <button
                onClick={() => handleDeleteCategory(category.name)}
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
                {category.subcategories.map(sub => (
                  <tr key={sub._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{truncateDetails(sub.details.join(', '), 50)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs.{sub.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleUpdateClick(category.name, sub.name)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category.name, sub.name, category.type)} // Pass category.type as 'type'
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
  );
}

export default SubcategoryTable;
