import "./App.css";
import OpenAIApi from "openai";
import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const openai = new OpenAIApi({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Carrega a chave do ambiente
    dangerouslyAllowBrowser: true,
    baseURL: "https://api.openai.com/v1", // Use este endpoint
  });

  // Setar numa state todos os dados do arquivo
  const capturarArquivo = (event) => {
    let array_arquivos = event.target.files;
    console.log("array_arquivos", array_arquivos);
    // let formatos_aceito = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

    //verificacao do tipo de arquivo
    if (array_arquivos[0]?.type != undefined) {
      //verificacao do formato de arquivo, se pdf ou imagem
      // if (formatos_aceito.includes(array_arquivos[0]?.type)) {

      setFile(event.target.files);

      // } else {

      // document.querySelector('#input_file').value = '';
      // return
      // }
    }
  };

  async function askChatGPT(e) {
    e.preventDefault();
    let prompt = input;
    let arquivo = 0;
    let extensao = ''

    console.log("prompt", prompt);
    // console.log("arquivo", formData);
    console.log("file", file);

    if (file != null) {
      for (const arq of file) {
        const formData = new FormData();
        formData.append("file", arq);
        console.log('formData', formData)
        console.log('arq', arq)

        if (arq?.name.includes('sql')) {
          const reader = new FileReader()

          const sqlContent = reader.readAsText(arq, 'utf-8');
          arquivo = sqlContent;
          extensao = 'sql'
        } else {
          
          try {
            // const file = await openai.files.create({
          //   file: fs.createReadStream(req.file.path),
          //   purpose: "assistants", // ou "fine-tune", dependendo do uso
          // });
          console.log("formData", formData);
          const res = await fetch("http://localhost:8080/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log("data", data);
          console.log("File ID:", data.fileId);
          arquivo = data.fileId;
          extensao = `${data?.split('.')[1]}`
                    // return data.fileId;
        } catch (error) {
          console.log("erro ao enviar arquivo", error);
        }
      }
      }
    }
    setLoading(true);
    console.log('extensao', extensao)

    let data = {
      model: "gpt-4o", // Ou "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "Você é um assistente útil." },
        {
          role: "user",
          content: 
            extensao == 'sql' ? 
            [{ type: "text", text: `${prompt} ${arquivo}` }]
            :
            [{ type: "text", text: prompt },{ type: "file", file: { file_id: arquivo } },]
        }    
      ],
      store: true,
      // stream: true,
      stream: false,
      temperature: 0.7, // Controle de criatividade (0 a 1)
      max_tokens: 150, // Máximo de palavras na resposta
    }
    console.log('data', data)

    try {
      const response = await openai.chat.completions.create(data);
      console.log("response", response);

      // return response.data.choices[0].message.content;

      console.log("first", response.choices[0].message.content);

      setResponse(response.choices[0].message.content);
    } catch (error) {
      console.error("Erro ao acessar a API:", error);
      // return "Ocorreu um erro ao processar sua solicitação.";
      setResponse("Ocorreu um erro ao processar sua solicitação.");
    }
    setLoading(false);
  }

  return (
    <div className="App">
      <div className="container">
        <div className="text-plan">
          <p>{response || "Olá faça uma pergunta"}</p>
        </div>

        <form
          onSubmit={askChatGPT}
          className="mb-4"
          enctype="multipart/form-data"
        >
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
          <input
            type="file"
            name="file"
            className="border p-2 w-full rounded"
            // placeholder="Digite sua pergunta..."
            // value={file}
            onChange={capturarArquivo}
          />
        </form>
      </div>
    </div>
  );
}

export default App;
