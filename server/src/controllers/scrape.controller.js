import { fetchDataAndSave } from "../services/scrape.service.js";

export const fetchAndSaveData = async (req, res) => {
  try {
    const result = await fetchDataAndSave();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};