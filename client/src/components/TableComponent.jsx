import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const TableComponent = ({ refreshData, onRefresh }) => {
  const [tablesData, setTablesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refreshData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/fetch-data');
      if (response.data.success) {
        const modifiedData = response.data.data
          .map((table) => ({
            ...table,
            tableName: table.tableName.replace(/_/g, ' '),
            rows: table.rows.map((row) => {
              const newHarga = row.harga + 2000;
              const roundedHarga = Math.ceil(newHarga / 1000) * 1000;
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
          }))
          .filter((table) => !table.rows.some((row) => row.keterangan.toLowerCase().includes('pulsa')));

        // console.log(modifiedData); // Log data yang dimodifikasi

        setTablesData(modifiedData);
      } else {
        console.error('Gagal mengambil data:', response.data.error);
      }
    } catch (error) {
      console.error('Error saat pengambilan data:', error);
    }
    setLoading(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await axios.get('http://localhost:3000/fetch-data-save');
      onRefresh();
    } catch (error) {
      console.error('Error saat merefresh data:', error);
    }
    setLoading(false);
  };

  const filteredData = tablesData.filter((table) =>
    table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative p-4">
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Cari"
          value={searchTerm}
          onChange={handleSearch}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        filteredData.map((table, index) => (
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
        ))
      )}
      <button
        onClick={handleManualRefresh}
        className="fixed hidden bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh'}
      </button>
    </div>
  );
};

TableComponent.propTypes = {
  refreshData: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default TableComponent;
