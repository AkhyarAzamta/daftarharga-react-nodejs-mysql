import prisma from '../config/database.js';

export const fetchData = async (page = 1, limit = 5) => {
  try {
    const skip = (page - 1) * limit; // Hitung offset
    
    // [PERUBAHAN PENTING] Query dengan pagination
    const products = await prisma.product.findMany({
      skip: skip,       // Melewati data sebelumnya
      take: limit,      // Mengambil data sebanyak limit
      orderBy: {
        category: 'asc'
      },
      include: {
        // Jika ada relasi, bisa ditambahkan di sini
      }
    });

    // Hitung total data untuk informasi pagination
    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / limit);

    // Grouping by category tetap sama
    const groupedData = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    return { 
      success: true, 
      data: groupedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error('Error in dataService:', error);
    throw error;
  }
};