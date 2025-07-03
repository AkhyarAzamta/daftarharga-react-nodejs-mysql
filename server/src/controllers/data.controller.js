import { fetchData } from '../services/data.service.js';

export const getPaginatedData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const groupBy = req.query.groupBy || 'provider';
    const provider = req.query.provider;   // misal ?provider=Axis
    const category = req.query.category;   // misal ?category=Free_Fire
    const search = req.query.search;          // <-- baru

    const result = await fetchData({
      page,
      limit,
      groupBy,
      provider,
      category,
      search
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
