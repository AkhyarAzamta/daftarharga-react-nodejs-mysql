import app from './src/app.js';
import cron from 'node-cron';
import { fetchDataAndSave } from './src/services/scrape.service.js';

const PORT = process.env.PORT || 3000;

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Jadwalkan scrape & save setiap hari pukul 02:00
cron.schedule('0 2 * * *', async () => {
  console.log('Cron job started at', new Date().toLocaleString());
  try {
    const result = await fetchDataAndSave();
    console.log('Cron job result:', result.message);
  } catch (err) {
    console.error('Cron job error:', err);
  }
}, {
  timezone: process.env.TIMEZONE || 'Asia/Jakarta'
});

console.log('Cron scheduler initialized (02:00 daily)');