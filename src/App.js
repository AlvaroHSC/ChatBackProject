import "./App.css";
import OpenAIApi from "openai";
import { useState } from 'react'

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const openai = new OpenAIApi({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Carrega a chave do ambiente
    dangerouslyAllowBrowser: true,
    baseURL: "https://api.openai.com/v1", // Use este endpoint
  });

  async function askChatGPT(e) {
    e.preventDefault();
    let prompt = input
    setLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Ou "gpt-3.5-turbo"
        messages: [
          { role: "system", content: "Você é um assistente útil." },
          { role: "user", content: prompt },
        ],
        store: true,
        stream: true,
        temperature: 0.7, // Controle de criatividade (0 a 1)
        max_tokens: 150, // Máximo de palavras na resposta
      });
      console.log('response', response)

      // return response.data.choices[0].message.content;
      setResponse(response.data.choices[0].message.content)
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
      // return "Ocorreu um erro ao processar sua solicitação.";
      setResponse("Ocorreu um erro ao processar sua solicitação.")
    }
    setLoading(false);
  }

  return (
    <div className="App">
      <form onSubmit={askChatGPT} className="mb-4">
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="Digite sua pergunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Carregando..." : "Enviar"}
        </button>
      </form>

      <p>{response}</p>
    </div>
  );
}

export default App;
