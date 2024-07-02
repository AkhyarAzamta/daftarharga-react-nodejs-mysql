import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const TableComponent = ({ searchTerm }) => {
  const [tablesData, setTablesData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/fetch-data');
      if (response.data.success) {
        const modifiedData = response.data.data
          .map((table) => {
            // Filter rows that contain "pulsa" in `keterangan`
            const filteredRows = table.rows.filter(row => !row.keterangan.toLowerCase().includes('pulsa'));
            
            // Only keep tables with at least one row after filtering
            if (filteredRows.length > 0) {
              return {
                ...table,
                tableName: table.tableName.replace(/_/g, ' '), // Ganti underscore dengan spasi
                rows: filteredRows.map((row) => {
                  // Tambahkan 3000 ke harga dan bulatkan ke ribuan terdekat
                  const newHarga = row.harga + 2000;
                  const roundedHarga = Math.ceil(newHarga / 1000) * 1000;
                  // Format harga sebagai mata uang dengan titik desimal
                  const formattedHarga = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(roundedHarga);
                  return {
                    ...row,
                    harga: formattedHarga,
                  };
                }),
              };
            } else {
              // Return null for tables with no rows left after filtering
              return null;
            }
          })
          .filter(table => table !== null); // Filter out null tables

        console.log(modifiedData);
        setTablesData(modifiedData);
      } else {
        console.error('Gagal mengambil data:', response.data.error);
      }
    } catch (error) {
      console.error('Error saat pengambilan data:', error);
    }
  };

  const filteredData = tablesData.filter((table) =>
    table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      {filteredData.map((table, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-2xl text-center font-bold mb-4">{table.tableName}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-400 divide-y divide-gray-200">
              <thead className="bg-sky-200">
                <tr>
                  <th className="px-4 py-2 text-left">Kode</th>
                  <th className="px-4 py-2 text-left">Keterangan</th>
                  <th className="px-4 py-2 text-left">Harga</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.length > 0 ? (
                  table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2">{row.kode}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{row.keterangan}</td>
                      <td className="px-4 py-2">{row.harga}</td>
                      <td className="px-4 py-2">{row.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center px-4 py-2">No results found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// PropTypes validation for each table object
TableComponent.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default TableComponent;
