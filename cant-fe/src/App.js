import React, { useEffect } from 'react';
import './App.css';

const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // window.location.href = 'http://wehelpyou.study';
    }, 60000);

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, []);

  const handleRedirect = (url) => {
    window.location.href = url;
  };

  return (
    <div className="container">
      <img src={`/logo.png`} alt="Logo" className="logo" />
      <h1 className="title">CANT.STUDY?</h1>
      <button className="learn-more" onClick={() => handleRedirect('http://wehelpyou.study')}>
        Try for free now!
      </button>
      <br/>
      <br/>
      <a href="#!" onClick={() => handleRedirect('http://wehelpyou.study')} className="subtitle">
        WeHelpYou.study
      </a>
      
    </div>
  );
};

export default App;
