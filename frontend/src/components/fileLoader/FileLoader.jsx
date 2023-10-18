import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./FileLoader.scss"; 
import { toast } from 'react-toastify';
import Loader from "../../components/loader/Loader"; 

const FileLoader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedText, setConvertedText] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(''); // State to store the selected language
  const [TranslatedTxt, setTranslatedTxt] = useState(''); 

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

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);

    if (selectedLanguage && convertedText) { 
      setIsLoading(true) 
      axios.get(`http://127.0.0.1:5000/api/translate_to${selectedLanguage}/${convertedText}`)
        .then((response) => {  
          console.log(response.data)
          setTranslatedTxt(response.data.translated_txt);
          toast.success("Translated succesfully!")
          setIsLoading(false)
        })
        .catch((error) => { 
          console.log(error);
          setIsLoading(false) 
          toast.error('Conversion error!');
        });
    }
  };
 
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
    <div>
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
          <hr className='line'/>
          {convertedText && (
            <div className="converted-text">
              <h3>Converted Text:</h3>
              <div className='output'>{convertedText}</div>
            </div>
          )}
        </div>   
      </div>
      {convertedText && (
        <div className="language-selector">
          <h2 className='topic'>Select a Language To Translate To</h2>
          <button className={`language-option ${selectedLanguage === 'tr' ? 'selected' : ''}`} onClick={() => handleLanguageSelect('tr')}>
            <p>Turkish</p>
          </button>
          {isLoading && <Loader />}
          <button className={`language-option ${selectedLanguage === 'ar' ? 'selected' : ''}`} onClick={() => handleLanguageSelect('ar')}>
            <p>Arabic</p>
          </button>
          {isLoading && <Loader />}
        </div>
      )} 
      {TranslatedTxt && (
        <div>
          <h3 className='head2'>Translated Text: </h3>
          <p>{TranslatedTxt}</p>
        </div>
      )}
    </div>
  );
};

export default FileLoader;
