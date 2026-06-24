import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = input
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");

      const res = await axios.post(
        "https://bfhl-api-k6g4.onrender.com/bfhl",
        { data }
      );

      setResponse(res.data);
    } catch (error) {
      alert("API Error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>BFHL Hierarchy Builder</h1>

      <textarea
        rows="8"
        placeholder="A->B, A->C, B->D"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={handleSubmit}>
        {loading ? "Loading..." : "Submit"}
      </button>

      {response && (
        <div className="result">
          <h2>Response</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;