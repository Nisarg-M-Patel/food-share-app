// client/src/components/Camera.js
import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaTimes, FaSync } from 'react-icons/fa';

const Camera = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    initializeCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: { facingMode },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };

  const switchCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(previous => previous === 'environment' ? 'user' : 'environment');
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg');
    onCapture(imageData);
    
    // Clean up
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="camera-container">
      <div className="camera-content">
        <div className="camera-header">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        {error ? (
          <div className="camera-error">
            <p>{error}</p>
          </div>
        ) : (
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div className="camera-controls">
              <button className="switch-btn" onClick={switchCamera}>
                <FaSync />
              </button>
              <button className="capture-btn" onClick={captureImage}>
                <FaCamera />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .camera-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #000;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .camera-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .camera-header {
          padding: 15px;
          display: flex;
          justify-content: flex-end;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 5px;
        }

        .camera-error {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          color: white;
        }

        .video-container {
          flex: 1;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #000;
        }

        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-controls {
          position: absolute;
          bottom: 30px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
        }

        .capture-btn {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #333;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .capture-btn:hover {
          transform: scale(1.1);
        }

        .switch-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          transition: background-color 0.3s;
        }

        .switch-btn:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Camera;