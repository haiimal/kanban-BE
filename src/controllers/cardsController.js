import * as cardsService from "../services/cardsService.js";

// GET all cards by columns_id
export const getCardsByColumn = async (req, res) => {
  console.log("GET /api/cards/:columns_id hit");
  const { columns_id } = req.params;

  try {
    const data = await cardsService.getCardsByColumn(columns_id);
    res.json({
      message: `Success get all cards for column ${columns_id}`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data cards" });
  }
};

// POST create card
export const createCard = async (req, res) => {
  console.log("POST /api/cards hit");
  const { columns_id, title, description, due_date } = req.body;

  try {
    const data = await cardsService.createCard(
      columns_id,
      title,
      description,
      due_date
    );
    res.status(201).json({
      message: "Card created successfully",
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// PUT update card
export const updateCard = async (req, res) => {
  console.log("PUT /api/cards/:id hit");
  const { id } = req.params;
  const { title, description, due_date, columns_id } = req.body;

  try {
    const fieldsToUpdate = {
      ...(title && { title }),
      ...(description && { description }),
      ...(due_date && { due_date }),
      ...(columns_id && { columns_id }), // buat pindahin card ke column lain
    };

    const data = await cardsService.updateCard(id, fieldsToUpdate);
    res.json({
      message: `Card ${id} updated successfully`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengupdate card" });
  }
};

// DELETE card
export const deleteCard = async (req, res) => {
  console.log("DELETE /api/cards/:id hit");
  const { id } = req.params;

  try {
    await cardsService.deleteCard(id);
    res.json({ message: `Card ${id} deleted successfully` });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal menghapus card" });
  }
};
