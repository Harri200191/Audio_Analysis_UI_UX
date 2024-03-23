import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom"; 
import axios from 'axios';
import "./FileLoader.scss"; 
import { toast } from 'react-toastify';
import Loader from "../../components/loader/Loader"; 
import { selectName, SET_LOGIN } from "../../redux/features/auth/authslice";
import { createUserWithFile } from '../../services/authServices';

const FileLoader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedText, setConvertedText] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');  
  const [TurkTranslatedTxt, setTurkTranslatedTxt] = useState(''); 
  const [ArTranslatedTxt, setArTranslatedTxt] = useState(''); 
  const [EnTranslatedTxt, setEnTranslatedTxt] = useState(convertedText); 
  const [HiTranslatedTxt, setHiTranslatedTxt] = useState(''); 
  const [Topic, setTopic] = useState('');  
  const [Topic5, setTopic5] = useState(''); 
  const [EnSumm, setEnSumm] = useState(''); 
  const [TrSumm, setTrSumm] = useState(''); 
  const [ArSumm, setArSumm] = useState(''); 
  const [PosPerc, setPosPerc] = useState(null)
  const [NegPerc, setNegPerc] = useState(null)
  const [flag, setFlag] = useState(false)
  const [noofpeople, setnoofpeople] = useState(null)
  const [language, setLanguage] = useState('en-US');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const name = useSelector(selectName);

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
      formData.append('name', name);
      setIsLoading(true) 

      let newformData = new FormData();
      newformData.append('file', `C:\\Audio_Analysis_UI_UX\\uploads\\${name}\\output.mp3`); 

      const fileName = selectedFile.name;
      const fileExtension = fileName.split('.').pop();
      
      if (fileExtension === "mp4"){
        axios.post(`http://127.0.0.1:5000/api/convert-video-to-mp3`, formData, {withCredentials: true})
        .then((response) => {   
          toast.success("Changed to wav format!")
          setIsLoading(true) 
          setTimeout(() => {
            axios.post(`http://127.0.0.1:5000/api/convert-mp4-to-text`, formData, {withCredentials: true})
            .then((response) => { 
              let txt = response.data.text
              setConvertedText(response.data.text);
              toast.success("Converted to text!") 
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
        })
        .catch((error) => { 
          console.log(error)
          setIsLoading(false)  
        });
        return null;
      } 

      axios.post(`http://127.0.0.1:5000/api/convert-mp3-to-text`, formData, {withCredentials: true})
      .then((response) => { 
        let txt = response.data.text
        setConvertedText(response.data.text);
        toast.success("Converted to text!") 
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

  const FindPeople = (txt) =>{    
    setIsLoading(true);

    const formData = new FormData();  
    formData.append('file', selectedFile);  
    formData.append('name', name);
    
    axios.get(`http://127.0.0.1:5000/api/translate_toen/${txt}`, {withCredentials: true})
    .then((response) => {   
      let entxt = response.data.translated_txt
      setEnTranslatedTxt(response.data.translated_txt);
      toast.success("Translated succesfully!");
      setIsLoading(true) 
      setTimeout(() => {
        axios.post(`http://127.0.0.1:5000/api/analyze-audio/${entxt}`, formData, {withCredentials: true})
          .then((response) => {   
            setnoofpeople(response.data.person_count);  
            toast.success("People Found succesfully!")  
            setTimeout(() => {
              FindTopic(entxt);
            }, 3000);
          })
        }, 1000)
        .catch((error) => {  
          console.log(error)
          setIsLoading(false) 
          toast.error('Some error!');
        }); 
      setIsLoading(false);
    })
    .catch(() => {  
      setIsLoading(false);
      //toast.error('Conversion error!');
    });


}

const FindTopic = (entxt) =>{   
  const formData = new FormData();  
  formData.append('file', selectedFile);  
  formData.append('name', name);

  setIsLoading(true) 
  axios.post(`http://127.0.0.1:5000/api/findtopic/${entxt}`, formData, {withCredentials: true})
    .then((response) => {   
      setTopic(response.data.topic);
      setTopic5(response.data.topic2);
      toast.success("Topic Found succesfully!")
      //setIsLoading(false)
      setTimeout(() => {
        FindSummary(entxt);
      }, 1000);
    })
    .catch((error) => {  
      console.log(error)
      setIsLoading(false) 
      toast.error('Some error!');
    }); 
}

  const FindSummary = (entxt) => { 
    const formData = new FormData();  
    formData.append('file', selectedFile);  
    formData.append('name', name);
    formData.append('text', entxt);

    setIsLoading(true) 
    axios.post(`http://127.0.0.1:5000/api/findSummary`, formData, {withCredentials: true})
      .then((response) => {  
        setArSumm(response.data.summary_ar);
        setTrSumm(response.data.summary_tr)
        setEnSumm(response.data.summary_en)
        toast.success("Topic Found succesfully!")

        setTimeout(() => {
          HandleSentiment(entxt);
        }, 1000);
 
        setIsLoading(false)
      })
      .catch((error) => {  
        console.log(error)
        setIsLoading(false) 
        toast.error('Some error!');
      }); 
  };

  const HandleSentiment = (txt) => {
    const formDataNew = new FormData();   
    formDataNew.append('file', selectedFile); 
    formDataNew.append('name', name);
    
    setIsLoading(true) 
    axios.post(`http://127.0.0.1:5000/api/sentiment/${txt}`, formDataNew, {withCredentials: true})
      .then((response) => {   
        setPosPerc(response.data.positive)
        setNegPerc(response.data.negative)
        setFlag(true)
        toast.success("Sentiments Retrieved!")
        setIsLoading(false)
      })
      .catch((error) => {  
        console.log(error)
        setIsLoading(false) 
        toast.error('Some error!');
      }); 
  };


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
              <h3>Topic Of The Video: </h3>   
              <p>{Topic5}</p>
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
      {flag && (
        <div className='summary_topic_2'>
          <h3>Sentiment Analysis</h3>
          <p>Positive Percentage: {PosPerc}</p>
          <p>Negative Percentage: {NegPerc}</p>
        </div>
      )}
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
