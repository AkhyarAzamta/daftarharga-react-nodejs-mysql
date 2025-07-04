import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '../config/database.js';
import { containsWholeWord } from '../utils/categoryNormalizer.js';

/**
 * Daftar kelompok keyword → nama kategori final.
 * Cek secara case‑insensitive.
 */
const CATEGORY_OVERRIDES = [
  { keys: ['telkomsel', 'tsel'], name: 'Telkomsel' },
  { keys: ['indosat', 'isat', 'freedom'], name: 'Indosat' },
  { keys: ['smartfren'], name: 'Smartfren' },
  { keys: ['three'], name: 'Three' },
  { keys: ['axis', 'xl/axis'], name: 'Axis' },
  { keys: ['axis', 'xl', 'xl/axis'], name: 'XL' },
  { keys: ['xl'], name: 'XL' },
  { keys: ['life after'], name: 'Life_After' },
  { keys: ['google play'], name: 'Google_Play' },
  { keys: ['apex legend mobile'], name: 'Apex_Legend_Mobile' },
  { keys: ['astral guardians'], name: 'Astral_Guardians' },
  { keys: ['call of duty'], name: 'Call_Of_Duty' },
  { keys: ['candy sausage man'], name: 'Candy_Sausage_Man' },
  { keys: ['clash of clans'], name: 'Clash_Of_Clans' },
  { keys: ['digipos'], name: 'Digipos' },
  { keys: ['delta force'], name: 'Delta_Force' },
  { keys: ['alfamart'], name: 'Alfamart' },
  { keys: ['devil hunter enternal'], name: 'Devil_Hunter_Enternal' },
  { keys: ['dragon raja'], name: 'Dragon_Raja' },
  { keys: ['e toll'], name: 'E_Toll' },
  { keys: ['fifa mobile'], name: 'Fifa_Mobile' },
  { keys: ['free fire'], name: 'Free_Fire' },
  { keys: ['honor of kings'], name: 'Honor_Of_Kings' },
];

function mapCategoryAndProvider(rawHeader) {
  for (const { keys, name } of CATEGORY_OVERRIDES) {
    if (keys.some(k => containsWholeWord(rawHeader, k))) {
      return { category: name, provider: name };
    }
  }
  const fallback = rawHeader
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('_');
  return { category: fallback, provider: fallback };
}

export const fetchDataAndSave = async () => {
  const url = process.env.SCRAPE_URL;
  if (!url) throw new Error('SCRAPE_URL not defined');

  // 1. Fetch halaman
  const resp = await axios.get(url, { timeout: 60000 });
  const $ = cheerio.load(resp.data);
  const tables = $('.tablewrapper table.tabel');

  // 2. Parse semua baris
  const allProducts = [];
  tables.each((_, tableElem) => {
    const rawHeader = $(tableElem)
      .find('tr.head td[colspan="6"]').first().text().trim();
    if (!rawHeader) return;
    const { category, provider } = mapCategoryAndProvider(rawHeader);

    $(tableElem)
      .find('tr.td1, tr.td2')
      .each((_, rowElem) => {
        const cols = $(rowElem).find('td');
        if (cols.length < 4) return;
        const kode = cols.eq(0).text().trim();
        const keterangan = cols.eq(1).text().trim();
        const hargaText = cols.eq(2).text().trim().replace(/\./g, '');
        const harga = parseFloat(hargaText);
        const status = cols.eq(3).text().trim();
        if (!kode || !Number.isFinite(harga)) return;  // leksibilitas harga
        allProducts.push({ kode, keterangan, harga, status, category, provider });
      });
  });

  console.log(`Total scraped rows: ${allProducts.length}`);

  if (allProducts.length === 0) {
    return { success: true, message: 'No products found' };
  }

  // 3. Dedupe berdasarkan kode
  const uniqueMap = new Map();
  for (const p of allProducts) {
    // overwrite duplicates, supaya yang terakhir dipakai
    uniqueMap.set(p.kode, p);
  }
  const uniqueProducts = Array.from(uniqueMap.values());
  console.log(`Unique products after dedupe: ${uniqueProducts.length}`);

  // 4. Bulk save: truncate + createMany per batch
  const BATCH_SIZE = 2000;
  await prisma.$executeRaw`TRUNCATE TABLE products;`;

  for (let i = 0; i < uniqueProducts.length; i += BATCH_SIZE) {
    const batch = uniqueProducts.slice(i, i + BATCH_SIZE);
    await prisma.product.createMany({ data: batch, skipDuplicates: true });
    console.log(`Inserted batch ${i / BATCH_SIZE + 1}: ${batch.length} items`);
  }

  await prisma.$executeRaw`ANALYZE products;`;

  return { success: true, message: `Processed ${uniqueProducts.length} unique products` };
};
