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
  const [EnTranslatedTxt, setEnTranslatedTxt] = useState(''); 
  const [HiTranslatedTxt, setHiTranslatedTxt] = useState(''); 
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
  const [language, setLanguage] = useState('en-US');

 
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
      formData.append('language', language);
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
        setTimeout(() => {
          FindTopic(txt);
        }, 1000);
      })
      .catch((error) => {  
        console.log(error)
        setIsLoading(false) 
        toast.error('Some error!');
      }); 
}

const FindTopic = (txt) =>{   
  setIsLoading(true) 
  axios.get(`http://127.0.0.1:5000/api/findtopic/${txt}`, {withCredentials: true})
    .then((response) => {   
      setTopic(response.data.topic);
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
  setSelectedLanguage('tr');

  if (language && convertedText) { 
    setIsLoading(true) 
    axios.get(`http://127.0.0.1:5000/api/translate_to${language}/${convertedText}`)
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
  setSelectedLanguage('ar');

  if (language && convertedText) { 
    setIsLoading(true) 
    axios.get(`http://127.0.0.1:5000/api/translate_to${language}/${convertedText}`)
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

const handleLanguageSelectEn = (language) => {
  setSelectedLanguage('en');

  if (language && convertedText) { 
    setIsLoading(true) 
    axios.get(`http://127.0.0.1:5000/api/translate_to${language}/${convertedText}`)
      .then((response) => {   
        setEnTranslatedTxt(response.data.translated_txt);
        toast.success("Translated succesfully!")
        setIsLoading(false)
      })
      .catch((error) => {  
        setIsLoading(false) 
        toast.error('Conversion error!');
      });
  }
};


const handleLanguageSelectHi = (language) => {
  setSelectedLanguage('hi');

  if (language && convertedText) { 
    setIsLoading(true) 
    axios.get(`http://127.0.0.1:5000/api/translate_to${language}/${convertedText}`)
      .then((response) => {   
        setHiTranslatedTxt(response.data.translated_txt);
        toast.success("Translated succesfully!")
        setIsLoading(false)
      })
      .catch((error) => {  
        setIsLoading(false) 
        toast.error('Conversion error!');
      });
  }
};


const handleLanguageChange = (event) => {
  setLanguage(event.target.value);
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
        <div className='lan-choice'>
          <h2 className='head'>Choose Language in which the video is in:</h2> 
            <br />
            <label className='t1'>
              Choose Language:
              <select className='t2' value={language} onChange={handleLanguageChange}>
                <option value="en-US">English</option>
                <option value="ar-EG">Arabic</option>
                <option value="tr-TR">Turkish</option>
                <option value="hi-IN">Hindi</option>
              </select>
            </label>
            <br /> 
        </div>
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
          {Topic && (
            <div className='summary_topic'>
              <h3>Topic Of The Video </h3>
              <p>{Topic}</p>
              <br/>
              <h3>One Word Topic:</h3>
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
          <button className={`language-option ${selectedLanguage === 'en' ? 'selected' : ''}`} onClick={() => handleLanguageSelectEn('en')}>
            <p>English</p>
          </button>
          {isLoading && <Loader />}
          <button className={`language-option ${selectedLanguage === 'hi' ? 'selected' : ''}`} onClick={() => handleLanguageSelectHi('hi')}>
            <p>Hindi</p>
          </button>
          {isLoading && <Loader />}
        </div>
      )} 
      {isLoading && <Loader />}
      {!isLoading && TurkTranslatedTxt && (
        <div>
          <h3 className='head2'>Translated Text In Turkish: </h3>
          <p>{TurkTranslatedTxt}</p>
        </div>
      )}
      {!isLoading && ArTranslatedTxt && (
        <div>
          <h3 className='head2'>Translated Text In Arabic: </h3>
          <p>{ArTranslatedTxt}</p>
        </div>
      )}
      {!isLoading && EnTranslatedTxt && (
        <div>
          <h3 className='head2'>Translated Text In English: </h3>
          <p>{EnTranslatedTxt}</p>
        </div>
      )}
      {!isLoading && HiTranslatedTxt && (
        <div>
          <h3 className='head2'>Translated Text In Hindi: </h3>
          <p>{HiTranslatedTxt}</p>
        </div>
      )}
    </div>
  );
};

export default FileLoader;
