import React from "react";
import { useState } from "react";
import "./TextReader.css";

import { BeatLoader } from "react-spinners";
import { useEffect } from "react";

//Manage types here to make process dynamic - just add a case in processReadings() and necessary calculations
const sensorTypes = ["thermometer", "humidity", "monoxide"];

const TextReader = () => {
  const [output, setOutput] = useState();
  const [contentsArray, setContentsArray] = useState([""]);
  const [loading, setLoading] = useState(false);
  //   const [fileContent, setFileContent] = useState([]);

  const hideLoader = () => {
    setLoading(false);
  };
  const showLoader = () => {
    setLoading(true);
  };

  const evaluateLogFile = (logContentsStr: any) => {
    const file = logContentsStr.target.files[0];
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

      setContentsArray(reader.result!.toString().split("\n"));
    };
    reader.onerror = (err) => {
      console.log(err);
      alert(err);
    };
  };

  const handleClick = () => {
    showLoader();

    //Initialize two objects to record values from .txt accordingly. structuredReadings will be the parent object
    let structuredReadings: any = {
      reference: "",
      values: [],
    };
    let readings: any = {
      name: "",
      value: [],
    };
    //Begin Loop for each item on new line
    contentsArray.map((reading, index) => {
      if (index == 0) {
        structuredReadings.reference = {
          temperature: parseFloat(reading.split(" ")[1]),
          humidity: parseFloat(reading.split(" ")[2]),
          COConcentration: parseInt(reading.split(" ")[3]),
        };
      } else {
        if (
          //Matches iso date then we want to add to the respective sensor
          reading.match(
            /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/
          )
        ) {
          //Keep adding till reading becomes a sensor type and name, then hit else
          readings.value.push({
            temp: reading.split(" ")[1],
            date: reading.split(" ")[0],
          });
        } else {
          //If not date, we have new sensor readings to record, so reset/re-initialize
          readings = {
            name: "",
            value: [],
          };
          structuredReadings.values.push(readings);
          //After adding reference on ver first run, we add sensor type and name here next
          readings.name = reading;
        }
      }
    });

    processReadings(structuredReadings);
  };

  const handleTempCalculations = (readings: any, i: number): string => {
    let filteredData = readings.values.filter(
      (o: any) => o.name == readings.values[i].name
    );

    let parsedValues = filteredData[0].value.map((value: any) =>
      parseFloat(value.temp)
    );
    let sum = parsedValues.reduce((a: number, b: number) => a + b);
    let mean = sum / filteredData[0].value.length;
    let standardDeviation = Math.sqrt(
      parsedValues
        .map((x: number) => Math.pow(x - mean, 2))
        .reduce((a: number, b: number) => a + b) / filteredData[0].value.length
    );

    //if mean is within 0.5 then..
    if (
      mean >= parseFloat(readings.reference.temperature) - 0.5 &&
      mean <= parseFloat(readings.reference.temperature) + 0.5
    ) {
      if (standardDeviation < 3) {
        console.log("ultra precise");
        return "ultra precise";
      } else if (standardDeviation < 5) {
        console.log("very precise");
        return "very precise";
      }
    }
    return "precise";
  };

  const handleHumidityAndCOCalculations = (
    readings: any,
    i: number
  ): string => {
    let filteredData = readings.values.filter(
      (o: any) => o.name == readings.values[i].name
    );

    let parsedValues = filteredData[0].value.map((value: any) =>
      parseFloat(value.temp)
    );
    let allValuesPassed: boolean = false;
    if (readings.values[i].name.split(" ")[0] === "humidity") {
      for (var i = 0; i < parsedValues.length; i++) {
        if (
          parsedValues[i] >= readings.reference.humidity - 1 &&
          parsedValues[i] <= readings.reference.humidity + 1
        ) {
          allValuesPassed = true;
        } else {
          allValuesPassed = false;
          break;
        }
      }
    } else {
      for (var i = 0; i < parsedValues.length; i++) {
        if (
          parsedValues[i] >= readings.reference.COConcentration - 3 &&
          parsedValues[i] <= readings.reference.COConcentration + 3
        ) {
          allValuesPassed = true;
        } else {
          allValuesPassed = false;
          break;
        }
      }
    }

    if (allValuesPassed) {
      return "keep";
    } else {
      return "discard";
    }
  };

  const processReadings = (readings: any) => {
    let outputResult: string = "";
    let output: any = {};
    console.log(readings);
    for (var i = 0; i < readings.values.length; i++) {
      switch (readings.values[i].name) {
        case readings.values[i].name.match(`\\b${sensorTypes[0]}\\b`)?.input:
          //value in array is thermometer = matched
          outputResult = handleTempCalculations(readings, i);
          output[readings.values[i].name.split(" ")[1]] = outputResult;
          break;
        case readings.values[i].name.match(`\\b${sensorTypes[1]}\\b`)?.input:
          outputResult = handleHumidityAndCOCalculations(readings, i);
          output[readings.values[i].name.split(" ")[1]] = outputResult;
          break;
        case readings.values[i].name.match(`\\b${sensorTypes[2]}\\b`)?.input:
          outputResult = handleHumidityAndCOCalculations(readings, i);
          output[readings.values[i].name.split(" ")[1]] = outputResult;
          break;

        default:
          alert("Default case");
          break;
      }
    }
    hideLoader();
    setOutput(output);
  };

  return loading ? (
    <BeatLoader size={30} />
  ) : (
    <div className='flex-container'>
      <div className='row'>
        <h2>Upload text file below.</h2>
        <input id='file-input' type='file' onChange={evaluateLogFile} />
        <br />
        <button id='start-eval' onClick={handleClick}>
          Begin Evaluation
        </button>
        <p>{JSON.stringify(output, null, " ")}</p>
      </div>
    </div>
  );
};

export default TextReader;
