import React from "react";
import { useState } from "react";
import "./App.css";
import EvaluateLogFile from "./components/EvaluateLogFile";

function App() {
  const [contentsArray, setContentsArray] = useState("");

  const addFile = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      if (!(reader.result!.toString().lastIndexOf("reference", 0) === 0)) {
        //Quick check to make sure user uploaded the right file
        alert(
          "Please make sure the file you have uploaded has the correct file structure."
        );
        return;
      }

      setContentsArray(reader.result!.toString());
    };
    reader.onerror = (err) => {
      console.log(err);
      alert(err);
    };
  };

  return (
    <div className='App'>
      <div className='flex-container'>
        <div className='row'>
          <h1>365-Widgets</h1>
          <p className='Sub-title'>Affordable Home Sensors</p>
          <h2>Upload text file below.</h2>
          <input id='file-input' type='file' onChange={addFile} />
          <br />
          <EvaluateLogFile logContentsStr={contentsArray} />
        </div>
      </div>
    </div>
  );
}

export default App;
