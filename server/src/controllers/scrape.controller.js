import { fetchDataAndSave } from '../services/scrape.service.js';

export const scrapeData = async (req, res) => {
  try {
    const result = await fetchDataAndSave();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
