import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { fetchData } from '../services/data.service.js';

const stripUnderscore = (s = '') => s.replace(/_/g, ' ');

export const exportCsv = async (req, res) => {
  try {
    // 1) Ambil semua data
    const { data } = await fetchData({
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
      groupBy: 'none'
    });
    const flat = Object.values(data).flat();

    // 2) Transform provider (hilangkan underscore)
    const transformed = flat.map(item => ({
      ...item,
      provider: stripUnderscore(item.provider),
    }));

    // 3) Buat CSV
    const fields = ['kode', 'keterangan', 'harga', 'category', 'provider', 'status'];
    const parser = new Parser({ fields });
    const csv = parser.parse(transformed);

    // 4) Kirim sebagai file
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const exportXlsx = async (req, res) => {
  try {
    const { data } = await fetchData({
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
      groupBy: 'none'
    });
    const flat = Object.values(data).flat();

    // 2) Transform provider
    const transformed = flat.map(item => ({
      ...item,
      provider: stripUnderscore(item.provider),
    }));

    // 3) Buku kerja Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      { header: 'Kode', key: 'kode', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 40 },
      { header: 'Harga', key: 'harga', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Provider', key: 'provider', width: 20 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 25 },
      { header: 'Updated At', key: 'updatedAt', width: 25 },
    ];

    // 4) Tambah baris
    transformed.forEach(item => sheet.addRow(item));

    // 5) Kirim file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="products.xlsx"'
    );
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
