import React from 'react'
import {AiFillAudio} from "react-icons/ai";
import {FcAudioFile} from "react-icons/fc"
import {SiAudiomack} from "react-icons/si"
import { Link } from 'react-router-dom';
import "./Home.scss";
import heroImg from "../../assets/pngwing.com.png"
import { ShowOnLogin, ShowOnLogout } from '../../components/protect/HiddenLink';

const Home = () => {
  return (
    <div className='home'>
      <nav className='container --flex-between'>
        <div className="logo">
          <AiFillAudio size={35} />
          <FcAudioFile size={35} />
          <SiAudiomack size={35} />
        </div>

        <ul className='home-links'>
          <ShowOnLogout>
            <li>
              <Link to={"/register"}>Register</Link>
            </li>
          </ShowOnLogout>
          <ShowOnLogout>
            <li>
              <button className='--btn --btn-primary'>
                <Link to={"/login"}>Login</Link>
              </button>
            </li>
          </ShowOnLogout>
          <ShowOnLogin>
            <li>
              <button className='--btn --btn-primary'>
                <Link to={"/dashboard"}>Dashboard</Link>
              </button>
            </li>
          </ShowOnLogin>
        </ul>
      </nav>
      <section className='container hero'>
        <div className='hero-text'>
          <h1>Transcribe Your Videos,
            Convert Video to
            Text Online.</h1>
          <p>
            Convert Your Audio Files to Text, not just in English, but an array of other languages as well!
          </p>
          
          <div className="hero-buttons">
            <button className="--btn --btn-secondary">
              <Link to="/register">Get Started</Link>
            </button>
          </div>
          <div className="--flex-start">
            <NumberText num="1K" text="Brand Owners" />
            <NumberText num="1K" text="Active Users" />
            <NumberText num="50+" text="Partners" />
          </div>
        </div>

        <div className='hero-image'>
          <img src={heroImg} alt="Inventory" />
        </div>  

      </section>
    </div>
  )
};

const NumberText = ({ num, text }) => {
  return (
    <div className="--mr">
      <h3 className="--color-white">{num}</h3>
      <p className="--color-white">{text}</p>
    </div>
  );
};

export default Home