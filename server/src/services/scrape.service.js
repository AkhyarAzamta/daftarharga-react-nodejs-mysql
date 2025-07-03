import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../config/database.js";
import { sanitizeTableName } from "../utils/cheerio.utils.js";

export const fetchDataAndSave = async () => {
  try {
    const url = process.env.SCRAPE_URL;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const tables = $('table.tabel');
    
    for (let i = 0; i < tables.length; i++) {
      const table = tables.eq(i);
      const tableName = table.find('tr.head > td[colspan="6"]').text().trim();
      
      if (!tableName) {
        console.error('Table name not found for table', i);
        continue;
      }

      const sanitizedCategory = sanitizeTableName(tableName);
      const products = [];

      table.find('tr.td1, tr.td2').each((j, row) => {
        const kode = $(row).find('td').eq(0).text().trim();
        const keterangan = $(row).find('td').eq(1).text().trim();
        let harga = $(row).find('td').eq(2).text().trim().replace(/\./g, '');
        const status = $(row).find('td').eq(3).text().trim();
        harga = parseFloat(harga);

        if (kode && keterangan && !isNaN(harga)) {
          products.push({
            kode,
            keterangan,
            harga,
            status,
            category: sanitizedCategory
          });
        }
      });

      await Promise.all(products.map(product => 
        prisma.product.upsert({
          where: { kode: product.kode },
          update: product,
          create: product
        })
      ));

      console.log(`Processed ${products.length} products for category ${sanitizedCategory}`);
    }

    return { success: true, message: 'Data successfully scraped and saved' };
  } catch (error) {
    console.error('Error in scrapeService:', error);
    throw error;
  }
};