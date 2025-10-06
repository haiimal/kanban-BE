require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Hubungkan ke Supabase (pakai yang dari .env)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Tes koneksi ke tabel asli kamu
app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('project').select('*').limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
});

// Endpoint utama
app.get('/', (req, res) => {
  res.send('Server Kanban Backend berjalan dan konek ke DB!');
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
