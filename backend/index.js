const express = require("express");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const cors = require("cors");

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors()); // Permite chamadas do frontend
app.use(express.json());

// Upload de arquivo para OpenAI
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log('req.body', req.body)

  try {
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(req.file),
      purpose: "assistants", // ou "fine-tune" se for para treinamento
    });

    // Apaga o arquivo local após upload
    fs.unlinkSync(req.file.path);

    res.json({ fileId: uploadedFile.id });
  } catch (err) {
    console.error("Erro ao enviar para OpenAI:", err);
    res.status(500).json({ error: "Erro ao enviar arquivo para OpenAI." });
  }
});

const PORT = process.env.PORT || 8989;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});