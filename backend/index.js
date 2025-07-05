const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { OpenAI } = require("openai");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// Pasta pública para os arquivos zip
const publicDir = path.join(__dirname, "files");
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
app.use('/files', express.static(publicDir));

app.post("/generate-project", async (req, res) => {
  try {
    const { language, framework } = req.body;

    const prompt = `Gere um projeto backend completo em ${language}${framework ? ` usando o framework ${framework}` : ""}.

O projeto deve conter:
- Um arquivo de configuração (package.json, pyproject.toml, etc) com as dependências necessárias.
- Um servidor básico escutando na porta 3000.
- Rotas: GET /api/hello (retorna { message: "Olá, mundo!" }) e POST /api/echo (recebe e retorna JSON).
- Middleware para tratamento de erros.
- Script para execução local.
- Estrutura organizada em pastas (/routes, /controllers, etc).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você é um assistente útil." },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
    });

    const code = completion.choices[0].message.content;

    const projectDir = path.join(__dirname, "temp_project");
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

    // Detecta extensão com base na linguagem
    const extByLang = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      kotlin: "kt",
      scala: "scala",
      elixir: "ex"
    };
    const ext = extByLang[language.toLowerCase()] || "txt";

    fs.writeFileSync(path.join(projectDir, `index.${ext}`), code);

    const timestamp = Date.now();
    const zipName = `project_${timestamp}.zip`;
    const zipPath = path.join(publicDir, zipName);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");

    output.on("close", () => {
      fs.rmSync(projectDir, { recursive: true, force: true });

      res.json({
        projectZipUrl: `http://localhost:${PORT}/files/${zipName}`,
        chatResponse: code,
      });
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(projectDir, false);
    archive.finalize();

  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ error: "Erro ao gerar projeto" });
  }
});

const PORT = process.env.PORT || 8989;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
