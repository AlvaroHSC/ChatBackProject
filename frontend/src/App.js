import { useState } from "react";

function getFrameworkByLanguage(lang) {
  const frameworks = {
    javascript: "Express",
    typescript: "Express",
    python: "FastAPI",
    java: "Spring Boot",
    csharp: "ASP.NET Core",
    php: "Laravel",
    ruby: "Rails",
    go: "Gin",
    rust: "Actix",
    kotlin: "Ktor",
    scala: "Play Framework",
    elixir: "Phoenix",
  };
  return frameworks[lang] || "";
}

function App() {
  const [language, setLanguage] = useState("");
  const [framework, setFramework] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState("");

  async function generateProject(e) {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setZipUrl("");

    try {
      const res = await fetch("http://localhost:8989/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, framework }),
      });

      const data = await res.json();
      if (data.error) {
        setResponse("Erro: " + data.error);
      } else {
        setResponse(data.chatResponse);
        setZipUrl(data.projectZipUrl);
      }
    } catch (err) {
      setResponse("Erro na requisição: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <form onSubmit={generateProject}>
        <label>
          Linguagem:
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setFramework("");
            }}
          >
            <option value="">Selecione</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="kotlin">Kotlin</option>
            <option value="scala">Scala</option>
            <option value="elixir">Elixir</option>
          </select>
        </label>
        {language && (
          <label style={{ marginLeft: 10 }}>
            <input
              type="checkbox"
              onChange={(e) =>
                setFramework(e.target.checked ? getFrameworkByLanguage(language) : "")
              }
            />{" "}
            Usar framework: {getFrameworkByLanguage(language)}
          </label>
        )}

        <button type="submit" disabled={loading} style={{ marginLeft: 10 }}>
          {loading ? "Gerando..." : "Gerar Projeto"}
        </button>
      </form>

      <textarea
        style={{ width: "100%", height: "300px", marginTop: 20 }}
        value={response}
        readOnly
      />

      {zipUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={zipUrl} target="_blank" rel="noreferrer">
            <button>Baixar projeto .zip</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
