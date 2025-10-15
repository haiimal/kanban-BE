// controllers/cardsController.js

// Ambil semua card berdasarkan columns_id
const getAllCards = async (req, res) => {
  console.log("GET /api/cards/:columns_id hit");
  const { columns_id } = req.params;
  const cards = [
    { id: 1, columns_id, title: "Buat UI", description: "Desain halaman utama", due_date: "2025-10-20" },
    { id: 2, columns_id, title: "Setup API", description: "Bikin route project", due_date: "2025-10-22" },
  ];
  res.json({
    message: `Success get all cards for column ${columns_id}`,
    data: cards,
  });
};

// Buat card baru
const createCard = async (req, res) => {
  console.log("POST /api/cards hit");
  const { columns_id, title, description, due_date } = req.body;
  res.status(201).json({
    message: "Card created (dummy)",
    data: { id: 999, columns_id, title, description, due_date },
  });
};

// Hapus card berdasarkan id
const deleteCard = async (req, res) => {
  console.log("DELETE /api/cards/:id hit");
  const { id } = req.params;
  res.json({
    message: `Card ${id} deleted (dummy)`,
  });
};

export { getAllCards, createCard, deleteCard };
