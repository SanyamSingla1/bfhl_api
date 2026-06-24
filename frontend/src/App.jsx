import { useState } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const data = input
        .split(",")
        .map(item => item.trim());

      const res = await axios.post(
        "https://YOUR-BACKEND-URL.onrender.com/bfhl",
        { data }
      );

      setResult(res.data);
    } catch (err) {
      alert("API Error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>BFHL Challenge</h1>

      <textarea
        rows="8"
        cols="50"
        value={input}
        placeholder="A->B, A->C, B->D"
        onChange={(e) => setInput(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        Submit
      </button>

      <pre>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default App;