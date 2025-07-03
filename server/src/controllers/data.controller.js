import { fetchData } from "../services/data.service.js";

export const fetchDataController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Default 5 items per page
    
    const result = await fetchData(page, limit); // Kirim parameter pagination
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};