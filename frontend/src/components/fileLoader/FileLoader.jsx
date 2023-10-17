import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./FileLoader.scss"; 
import { toast } from 'react-toastify';
import Loader from "../../components/loader/Loader";

const FileLoader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedText, setConvertedText] = useState('');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // Function to clear the selected file
  const clearFile = () => {
    setSelectedFile(null);
    setConvertedText('');
    localStorage.removeItem('selectedFile');
    localStorage.removeItem('convertedText');
  };

  const handleConversion = () => {
/*     if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Make an API call to the server for conversion
      axios.post(`${BACKEND_URL}/api/users/convert-to-wav`, formData)
        .then((response) => {
          console.log(selectedFile); 
          setSelectedFile(response.data.wavFileName);
          console.log(selectedFile); 
          console.log(response);
          toast.success('Conversion successful!');
        })
        .catch((error) => {
          console.log(error)
          toast.error('Conversion error:', error);
        });
    } */

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setIsLoading(true)
      // Make an API call to the server for MP3 to text conversion
      axios.post(`http://127.0.0.1:5000/api/convert-mp3-to-text`, formData, {withCredentials: true})
        .then((response) => { 
          setConvertedText(response.data.text);
          toast.success("Converted to text!")
          setIsLoading(false)
        })
        .catch((error) => { 
          setIsLoading(false) 
          toast.error('Conversion error!');
        });
    }
  }
 
  useEffect(() => {
    if (selectedFile) {
      localStorage.setItem('selectedFile', selectedFile.name);
    }
  }, [selectedFile]);

  useEffect(() => {
    const storedText = localStorage.getItem('convertedText');
    if (storedText) {
      setConvertedText(storedText);
    }
  }, []);

  return (
    <div className="file-selector-container">
      <div className="file-selector-box">
        <h2>Choose Your File</h2>
        <div className="file-input-container">
          <label className="file-choose-button" htmlFor="file-input">Choose a File</label>
          <input
            type="file"
            id="file-input"
            accept="audio/*, video/*" // Allow audio and video formats
            className="file-input"
            onChange={handleFileSelect}
          />
        </div>
        {selectedFile && (
          <div className="selected-file">
            Selected File: {selectedFile.name}   
            <br/>   
            <button onClick={clearFile}>Clear</button>
            <br/> 
            <button onClick={handleConversion}>Convert to Text</button>
            {isLoading && <Loader />}
          </div>
        )}
        <br/>
        <hr/>
        {convertedText && (
          <div className="converted-text">
            <h3>Converted Text:</h3>
            <div className='output'>{convertedText}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileLoader;
