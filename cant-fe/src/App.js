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
      <a href="#!" onClick={() => handleRedirect('http://wehelpyou.study')} className="subtitle">
        WEHELPYOU.study
      </a>
      <br />
      <button className="learn-more" onClick={() => handleRedirect('http://wehelpyou.study')}>
        Learn More
      </button>
    </div>
  );
};

export default App;
