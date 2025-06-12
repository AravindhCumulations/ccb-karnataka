// src/UploadPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Mic, 
  Square, 
  Image as ImageIcon, 
  Video, 
} from 'lucide-react';
import './UploadPage.css'
import AppHeader from '../components/AppHeader';
import { useNavigate } from 'react-router-dom';


const UploadPage: React.FC = () => {
  const navigate = useNavigate();
    const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedPhoto(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedVideo(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };


    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);


    const toggleRecording = async () => {
        if (!isRecording) {
            try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                  type: 'audio/webm;codecs=opus',
                });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url); // ✅ Save it to state
              };

            mediaRecorder.start();
            setRecordingTime('00:00'); // Optional: Reset timer
            setIsRecording(true);
            } catch (err) {
            alert('Microphone access denied or not supported');
            console.error(err);
            }
        } else {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        }
    };

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
    if (isRecording) {
        let seconds = 0;
        timerRef.current = setInterval(() => {
        seconds++;
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        setRecordingTime(`${mins}:${secs}`);
        }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
    }, [isRecording]);



  return (
    <div className="app-container">
      <AppHeader />

      {/* Form Container */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="form">
          {/* Information Upload Header */}
          <div className="form-header">
            <ArrowLeft onClick={() => navigate('/')}/>
            <h2 className="form-title">Information Upload</h2>
          </div>

          {/* Mobile Number Section */}
          <div className="form-field">
            <label className="form-label">Mobile number</label>
            <div className="mobile-input-container">
              <div className="country-code-box">
                +91
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter Mobile Number"
                className="mobile-number-input"
              />
            </div>
            <p className="form-help-text">Your Mobile Number will be kept private and confidential</p>
          </div>

          {/* Email ID Section */}
          <div className="form-field">
            <label className="form-label">E-mail ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email ID"
              className="standard-input"
            />
            <p className="form-help-text">Your Mail ID will be kept private and confidential</p>
          </div>

          {/* Issue Location Section */}
          <div className="form-field">
            <label className="form-label">Issue Location</label>
            <div className="location-input-container">
              <input
                type="text"
                value={issueLocation}
                onChange={(e) => setIssueLocation(e.target.value)}
                placeholder="Select location"
                className="location-input"
              />
              <MapPin className="location-icon" />
            </div>
          </div>

          {/* Voice Note Section */}
          <div className="form-field">
            <label className="form-label">Voice Note</label>
            <div className="voice-note-container">
              <button
                type="button"
                onClick={toggleRecording}
                className={`voice-record-button ${isRecording ? 'recording' : ''}`}
              >
                {isRecording ? <Square /> : <Mic />}
              </button>
              <span className="recording-time">{recordingTime}</span>
            </div>

            {/* ✅ Audio Preview */}
            {audioUrl && (
                <audio controls src={audioUrl} className="audio-preview" />
            )}
          </div>

          {/* Upload Photo Section */}
          <div className="form-field">
            <label className="form-label">Upload Photo</label>
            <div 
              onClick={() => photoInputRef.current?.click()}
              className="upload-container"
            >
              <div className="upload-content">
                <ImageIcon />
                <span className="upload-text">
                  {uploadedPhoto ? uploadedPhoto.name : 'Upload Photo'}
                </span>
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="upload-input"
            />
          </div>

          {/* Upload Video Section */}
          <div className="form-field">
            <label className="form-label">Upload Video</label>
            <div 
              onClick={() => videoInputRef.current?.click()}
              className="upload-container"
            >
              <div className="upload-content">
                <Video />
                <span className="upload-text">
                  {uploadedVideo ? uploadedVideo.name : 'Upload Video'}
                </span>
              </div>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="upload-input"
            />
          </div>

          {/* Additional Notes Section */}
          <div className="form-field">
            <label className="form-label">Additional Notes</label>
            <div className="notes-container">
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Enter additional notes..."
                className="notes-textarea"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );

};

export default UploadPage;
