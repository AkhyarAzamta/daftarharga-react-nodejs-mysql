// eslint-disable-next-line no-unused-vars
import React from 'react';

// eslint-disable-next-line react/prop-types
const SearchBar = ({ searchTerm, onSearch }) => {
  return (
    <div className='flex justify-center'>
    <input
      type="text"
      placeholder="Cari berdasarkan nama tabel..."
      value={searchTerm}
      onChange={onSearch}
      className="mb-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded-md"
      />
      </div>
  );
};

export default SearchBar;
