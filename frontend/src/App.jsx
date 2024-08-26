import React, { useRef, useEffect, useState } from 'react';
import styles from './App.module.css';
import logo from './assets/react.svg';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState('');

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

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndPredict();
    }, 1000); // Predict every second

    return () => clearInterval(interval);
  }, []);

  const captureAndPredict = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg');

      fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          setPrediction(data[0].emotion);
          drawFaceBox(data[0].position);
        } else {
          setPrediction('No face detected');
        }
      })
      .catch(error => console.error('Error:', error));
    }
  };

  const drawFaceBox = (position) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.strokeStyle = '#00FF00';
      context.lineWidth = 2;
      context.strokeRect(position.x, position.y, position.width, position.height);
    }
  };

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
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        <div className={styles.buttonContainer}>
          <div className={styles.button}>
            {prediction ? ` ${prediction}` : 'Detecting...'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;