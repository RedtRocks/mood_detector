import React, { useRef, useEffect } from 'react';
import styles from './App.module.css';
import logo from './assets/react.svg';

function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Error accessing the camera:", err));
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <img src={logo} className={styles.mlsclogo} alt="mlsclogo" />
        </div>
        <div className={styles.text}>Facial Mood Detector</div>
      </div>
      <div className={styles.maincont}>
        <div className={styles.lines}></div>
        <div className={styles.lines}></div>
        <div className={styles.lines}></div>
        <div className={styles.livecamera}>
          <video ref={videoRef} autoPlay playsInline />
        </div>
        <div className={styles.buttonContainer}>
        <div className={styles.button}>Tum Itna Kyu Muskura rhe ho :/ </div></div>
      </div>
    </div>
  );
}

export default App;