import prisma from '../config/database.js';

/**
 * @param {object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string} options.groupBy      // 'provider' atau 'category'
 * @param {string=} options.provider    // optional filter provider
 * @param {string=} options.category    // optional filter category
 */

function transformHarga(harga) {
  // +2000, lalu ceil ke kelipatan 1000
  return Math.ceil((harga + 2000) / 1000) * 1000;
}

export const fetchData = async ({
  page = 1,
  limit = 100,
  groupBy = 'provider',
  provider,
  category,
  search
}) => {
  const skip = (page - 1) * limit;

  // bangun where‐clause dasar
  const where = {};
  if (provider) where.provider = provider;
  if (category) where.category = category;

  // jika ada search, tambahkan OR tanpa `mode`
  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { provider: { contains: q } },
      { category: { contains: q } },
      { kode: { contains: q } },
      { keterangan: { contains: q } },
    ];
  }

  // ambil data + count
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { category: 'asc' }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  // transform harga (misal +2000 & ceil)
  const transformedItems = items.map(item => ({
    ...item,
    harga: transformHarga(item.harga),
  }));

  // grouping
  const grouped = transformedItems.reduce((acc, item) => {
    const key = groupBy === 'category'
      ? item.category
      : item.provider;
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return {
    success: true,
    data: grouped,
    pagination: { page, limit, totalPages, totalItems: total },
  };
};
