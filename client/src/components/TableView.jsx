// src/components/TableView.jsx
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export default function TableView({ onRefreshToggle }) {
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        page,
        groupBy: 'provider',
        search: searchTerm
      };
      const { data: res } = await axios.get('http://localhost:3000/api/data', { params });
      if (!res.success) throw new Error(res.error);
      const arr = Object.entries(res.data).map(([tableName, rows]) => ({ tableName, rows }));
      setTables(arr);
      setTotalItems(res.pagination.totalItems);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Fetch data failed:', err);
    }
    setLoading(false);
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [onRefreshToggle, fetchData]);

  const handleSearchTerm = e => setSearchTerm(e.target.value);
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/scrape');
      onRefreshToggle();
    } catch (err) {
      console.error('Manual refresh failed:', err);
    }
    setLoading(false);
  };

  const handleRowsPerPageChange = e => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(1);
  };
  const goToFirst = () => setPage(1);
  const goToPrev = () => setPage(p => Math.max(1, p - 1));
  const goToNext = () => setPage(p => Math.min(totalPages, p + 1));
  const goToLast = () => setPage(totalPages);

  const filtered = tables
    .map(table => ({
      ...table,
      rows: table.rows.filter(r => {
        const q = searchTerm.toLowerCase();
        return (
          table.tableName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.kode.toLowerCase().includes(q) ||
          r.keterangan.toLowerCase().includes(q)
        );
      })
    }))
    .filter(table => table.rows.length > 0);
  return (
    <div className="h-screen overflow-y-auto bg-white">
      <div className="px-4">

        {/* Sticky Global Header */}
        <div className="sticky top-0 z-30 bg-white border-b shadow-md pt-4 pb-2 transition-shadow duration-300">
          <h1 className="text-2xl font-bold text-center mb-4">Daftar Harga AzamCell</h1>

          <div className="flex gap-4 mb-4 flex-wrap px-4">
            <input
              type="text"
              placeholder="Cari provider, category, kode atau keterangan…"
              value={searchTerm}
              onChange={handleSearchTerm}
              className="flex-grow px-4 py-2 border rounded"
            />
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {loading ? 'Refreshing…' : 'Refresh Data'}
            </button>
            {typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && (
              <>
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mengunduh data CSV?')) {
                      window.location.href = 'http://localhost:3000/api/export/csv';
                    }
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded"
                >
                  Download CSV
                </button>

                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mengunduh data XLSX?')) {
                      window.location.href = 'http://localhost:3000/api/export/xlsx';
                    }
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded"
                >
                  Download XLSX
                </button>
              </>
            )}
          </div>

          {/* Pagination */}
          <div className="flex px-4 items-center justify-between">
            <span className="text-sm">0 of {totalItems} row(s) selected.</span>

            <div className="flex items-center space-x-2">
              <label className="text-sm">
                Rows per page:
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="ml-1 border rounded px-1 py-0.5 text-sm"
                >
                  {[10, 50, 100, 1000].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              <button onClick={goToFirst} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">«</button>
              <button onClick={goToPrev} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">‹</button>

              <span className="text-sm">Page {page} of {totalPages}</span>

              <button onClick={goToNext} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">›</button>
              <button onClick={goToLast} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">»</button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center mt-10">Loading…</div>
        ) : (
          <>
            {filtered.length > 0 ? filtered.map(table => (
              <div key={table.tableName} className="mb-8">
                {/* Sticky Section Title */}
                <h2
                  className="sticky top-[160px] z-20 text-xl font-semibold bg-sky-600 text-center text-white p-2 shadow transition-all duration-300"
                >
                  {table.tableName.replace(/_/g, ' ')}
                </h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-sky-500 text-white sticky z-10 shadow">
                      <tr>
                        <th className="px-4 py-2 border">Kode</th>
                        <th className="px-4 py-2 border">Keterangan</th>
                        <th className="px-4 py-2 border">Harga</th>
                        <th className="px-4 py-2 border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, i) => (
                        <tr key={row.kode} className={i % 2 === 0 ? 'bg-sky-100' : ''}>
                          <td className="px-4 py-2 border">{row.kode}</td>
                          <td className="px-4 py-2 border">{row.keterangan}</td>
                          <td className="px-4 py-2 border text-center">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(row.harga)}
                          </td>
                          <td className={`px-4 py-2 text-center border font-semibold ${row.status.toLowerCase() === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                            {row.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              </div>
            )) : (
              <div className="text-center mt-10">Tidak ada produk ditemukan.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

TableView.propTypes = {
  onRefreshToggle: PropTypes.func.isRequired
};
