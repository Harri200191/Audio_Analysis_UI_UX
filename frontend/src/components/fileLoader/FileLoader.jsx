import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./FileLoader.scss"; 
import { toast } from 'react-toastify';
import Loader from "../../components/loader/Loader"; 

const FileLoader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedText, setConvertedText] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');  
  const [TurkTranslatedTxt, setTurkTranslatedTxt] = useState(''); 
  const [ArTranslatedTxt, setArTranslatedTxt] = useState(''); 
  const [Topic, setTopic] = useState(''); 
  const [Topic2, setTopic2] = useState(''); 
  const [Topic3, setTopic3] = useState(''); 
  const [EnSumm, setEnSumm] = useState(''); 
  const [TrSumm, setTrSumm] = useState(''); 
  const [ArSumm, setArSumm] = useState(''); 
  const [PosPerc, setPosPerc] = useState(null)
  const [NegPerc, setNegPerc] = useState(null)
  const [flag, setFlag] = useState(false)
  const [noofpeople, setnoofpeople] = useState(null)

 
  const handleFileSelect = (e) => {
    const file = e.target.files[0];     
    setSelectedFile(file);
  };
 
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

      let newformData = new FormData();
      newformData.append('file', "C:\\Audio_Analysis_UI_UX\\uploads\\output.mp3"); 

      const fileName = selectedFile.name;
      const fileExtension = fileName.split('.').pop();
      
      if (fileExtension == "mp4"){
        axios.post(`http://127.0.0.1:5000/api/convert-video-to-mp3`, formData, {withCredentials: true})
        .then((response) => {  
          let audi = response.data.audio_file
          toast.success("Changed to wav format!")
          setIsLoading(true) 
          setTimeout(() => {
            axios.post(`http://127.0.0.1:5000/api/convert-mp4-to-text`, {withCredentials: true})
            .then((response) => { 
              let txt = response.data.text
              setConvertedText(response.data.text);
              toast.success("Converted to text!")
              setIsLoading(false)
              setTimeout(() => {
                FindPeople(txt);
              }, 1000);
            })
            .catch((error) => { 
              console.log(error)
              setIsLoading(false) 
              toast.error('Cant Convert to text!');
            }); 
          }, 3000);

          setIsLoading(false) 
        })
        .catch((error) => { 
          console.log(error)
          setIsLoading(false) 
          toast.error('Conversion error!');
        });
        return null;
      } 

      axios.post(`http://127.0.0.1:5000/api/convert-mp3-to-text`, formData, {withCredentials: true})
      .then((response) => { 
        let txt = response.data.text
        setConvertedText(response.data.text);
        toast.success("Converted to text!")
        setIsLoading(false)
        setTimeout(() => {
          FindPeople(txt);
        }, 1000);
      })
      .catch((error) => { 
        console.log(error)
        setIsLoading(false) 
        toast.error('Conversion error!');
      });  
    } 
  }

  const FindPeople = (txt) =>{   
    setIsLoading(true) 
    axios.get(`http://127.0.0.1:5000/api/analyze-audio/${txt}`, {withCredentials: true})
      .then((response) => {   
        setnoofpeople(response.data.person_count);
        setTopic2(response.data.topic)
        setTopic3(response.data.topic2)
        toast.success("People Found succesfully!") 
        setIsLoading(false)
      })
      .catch((error) => {  
        console.log(error)
        setIsLoading(false) 
        toast.error('Some error!');
      }); 
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
              {isLoading && <Loader />}
              <hr className='line'/>
              <h3>Converted Text:</h3>
              <div className='output'>{convertedText}</div>
              {isLoading && <Loader />}
            </div>
          )}
        </div>   
      </div>
      <div> 
          {Topic2 && (
            <div className='summary_topic'> 
              <h3>Topic of the video </h3>
              <p>{Topic2}, {Topic3}</p>
              {isLoading && <Loader />}
            </div>
          )}
          {noofpeople && (
            <div className='summary_topic'>
              <h3>Number of people in the video</h3>
              <p>{noofpeople}</p> 
              {isLoading && <Loader />}
            </div>
          )}
      </div>
    </div>
  );
};

export default FileLoader;
