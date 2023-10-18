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
  const [TurkTranslatedTxt, setTurkTranslatedTxt] = useState(''); 
  const [ArTranslatedTxt, setArTranslatedTxt] = useState(''); 
  const [Topic, setTopic] = useState(''); 
  const [EnSumm, setEnSumm] = useState(''); 
  const [TrSumm, setTrSumm] = useState(''); 
  const [ArSumm, setArSumm] = useState(''); 

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
          let txt = response.data.text
          setConvertedText(response.data.text);
          toast.success("Converted to text!")
          setIsLoading(false)
          setTimeout(() => {
            FindTopic(txt);
          }, 1000);
        })
        .catch((error) => { 
          setIsLoading(false) 
          toast.error('Conversion error!');
        });
    } 

  }

  const FindTopic = (txt) =>{   
      setIsLoading(true) 
      axios.get(`http://127.0.0.1:5000/api/findtopic/${txt}`, {withCredentials: true})
        .then((response) => {   
          setTopic(response.data.topic);
          toast.success("Topic Found succesfully!")
          setTimeout(() => {
            FindSummary(txt);
          }, 1000);

          setIsLoading(false)
        })
        .catch((error) => {  
          console.log(error)
          setIsLoading(false) 
          toast.error('Some error!');
        }); 
  }

  const FindSummary = (txt) => { 
    setIsLoading(true) 
    axios.get(`http://127.0.0.1:5000/api/findSummary/${txt}`, {withCredentials: true})
      .then((response) => {  
        setArSumm(response.data.summary_ar);
        setTrSumm(response.data.summary_tr)
        setEnSumm(response.data.summary_en)
        toast.success("Topic Found succesfully!")
        setIsLoading(false)
      })
      .catch((error) => {  
        console.log(error)
        setIsLoading(false) 
        toast.error('Some error!');
      }); 
  }

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);

    if (language && convertedText) { 
      setIsLoading(true) 
      axios.get(`http://127.0.0.1:5000/api/translate_to${selectedLanguage}/${convertedText}`)
        .then((response) => {   
          setTurkTranslatedTxt(response.data.translated_txt);
          toast.success("Translated succesfully!")
          setIsLoading(false)
        })
        .catch((error) => {  
          setIsLoading(false) 
          toast.error('Conversion error!');
        });
    }
  };
 
  const handleLanguageSelectAr = (language) => {
    setSelectedLanguage(language);

    if (language && convertedText) { 
      setIsLoading(true) 
      axios.get(`http://127.0.0.1:5000/api/translate_to${selectedLanguage}/${convertedText}`)
        .then((response) => {   
          setArTranslatedTxt(response.data.translated_txt);
          toast.success("Translated succesfully!")
          setIsLoading(false)
        })
        .catch((error) => {  
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
              accept="audio/*, video/*"  
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
              <button className= "button-an" onClick={handleConversion}>Analyze!</button>
              {isLoading && <Loader />}
            </div>
          )}
          <br/>
          {convertedText && (
            <div className="converted-text">
              <hr className='line'/>
              <h3>Converted Text:</h3>
              <div className='output'>{convertedText}</div>
            </div>
          )}
        </div>   
      </div>
      <div> 
          {Topic && (
            <div className='summary_topic'>
              <h3>Topic of the video </h3>
              <p>{Topic}</p>
            </div>
          )}
          {EnSumm && (
            <div className='summary_topic_2'>
              <h3>Summary In English</h3>
              <p>{EnSumm}</p>
            </div>
          )}
          {TrSumm && (
            <div className='summary_topic_2'>
              <h3>Summary In Turkish </h3>
              <p>{TrSumm}</p>
            </div>
          )}
          {ArSumm && (
            <div className='summary_topic_2'>
              <h3>Summary in Arabic</h3>
              <p>{ArSumm}</p>
            </div>
          )}

            
      </div>
      {convertedText && (
        <div className="language-selector">
          <h2 className='topic'>Select a Language To Translate To</h2>
          <button className={`language-option ${selectedLanguage === 'tr' ? 'selected' : ''}`} onClick={() => handleLanguageSelect('tr')}>
            <p>Turkish</p>
          </button>
          {isLoading && <Loader />}
          <button className={`language-option ${selectedLanguage === 'ar' ? 'selected' : ''}`} onClick={() => handleLanguageSelectAr('ar')}>
            <p>Arabic</p>
          </button>
          {isLoading && <Loader />}
        </div>
      )} 
      {isLoading && <Loader />}
      {!isLoading && TurkTranslatedTxt && (
        <div>
          <h3 className='head2'>Translated Text: </h3>
          <p>{TurkTranslatedTxt}</p>
        </div>
      )}
      {!isLoading && ArTranslatedTxt && (
        <div>
          <h3 className='head2'>Translated Text: </h3>
          <p>{ArTranslatedTxt}</p>
        </div>
      )}
    </div>
  );
};

export default FileLoader;
