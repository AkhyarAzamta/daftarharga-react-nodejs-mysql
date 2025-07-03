// services/scrape.service.js
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

/**
 * Cek rawHeader, kalau mengandung salah satu key override → pakai nama override.
 * Kalau tidak, format full header jadi Title_Case dengan underscore.
 */

function mapCategoryAndProvider(rawHeader) {
  for (const { keys, name } of CATEGORY_OVERRIDES) {
    if (keys.some(k => containsWholeWord(rawHeader, k))) {
      // override: gunakan name untuk keduanya
      return { category: name, provider: name };
    }
  }

  // fallback: format Title_Case entire rawHeader
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

  const resp = await axios.get(url);
  const $ = cheerio.load(resp.data);
  const tables = $('.tablewrapper table.tabel');

  let total = 0;

  for (let i = 0; i < tables.length; i++) {
    const rawHeader = tables.eq(i)
      .find('tr.head td[colspan="6"]').first().text().trim();
    if (!rawHeader) continue;

    const { category, provider } = mapCategoryAndProvider(rawHeader);

    const products = tables.eq(i)
      .find('tr.td1, tr.td2')
      .map((_, row) => {
        const cols = $(row).find('td');
        if (cols.length < 4) return null;

        const kode = cols.eq(0).text().trim();
        const keterangan = cols.eq(1).text().trim();
        const harga = parseFloat(cols.eq(2).text().trim().replace(/\./g, ''));
        const status = cols.eq(3).text().trim();

        if (!kode || isNaN(harga)) return null;
        return { kode, keterangan, harga, status, category, provider };
      })
      .get()
      .filter(Boolean);

    for (const p of products) {
      await prisma.product.upsert({
        where: { kode: p.kode },
        update: {
          keterangan: p.keterangan,
          harga: p.harga,
          status: p.status,
          category: p.category,
          provider: p.provider
        },
        create: p
      });
    }

    total += products.length;
  }

  return { success: true, message: `Processed ${total} products` };
};
