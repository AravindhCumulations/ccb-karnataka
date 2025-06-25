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
import { useNavigate, useLocation } from 'react-router-dom';
import RecordRTC from 'recordrtc';
// import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile } from '@ffmpeg/util';



const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMobileNumber = location.state?.mobileNumber || '';
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const isMobileDisabled = !!initialMobileNumber;
  const [email, setEmail] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [additionalNotes, setAdditionalNotes] = useState('');

  const [recordingTime, setRecordingTime] = useState('00:00');

  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  // const [videoURL, setVideoURL] = useState<string | null>(null);
  // const [videoSizeMB, setVideoSizeMB] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB
  
    if (validFiles.length !== files.length) {
      alert("Some images were too large (max 10MB). Only smaller images are accepted.");
    }
  
    setUploadedPhotos(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Form submitted');
  };

    const toggleRecording = async () => {
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
    
          const recorder = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: RecordRTC.StereoAudioRecorder,
            desiredSampRate: 16000,
          });
    
          recorder.startRecording();
          recorderRef.current = recorder;
          setIsRecording(true);
        } catch (err) {
          alert('Microphone access denied or not supported');
          console.error(err);
        }
      } else {
        setIsRecording(false);
    
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current.getBlob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        });
    
        streamRef.current?.getTracks().forEach((track) => track.stop());
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


    const detectCurrentLocation = () => {
      setLoadingLocation(true);
    
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
    
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
            );
            const data = await response.json();
    
            const address = data?.display_name;
            if (address) {
              setIssueLocation(address);
            } else {
              // fallback to something more readable
              setIssueLocation(`${data?.address?.suburb || ''} ${data?.address?.city || ''} ${data?.address?.state || ''}`);
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            setIssueLocation(`${latitude}, ${longitude}`);
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation failed:', error);
          alert('Unable to access location. Please enable GPS.');
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };
    
    const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setIssueLocation(value);
    
      if (value.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
    
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );
    
        const data = await response.json();
    
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Autocomplete failed:', error);
        setSuggestions([]);
      }
    };

    const uploadToS3 = async (file: File) => {
      try {
        
        // Step 1: Get Signed URL from your Node.js backend
        const res = await fetch('https://erbmnx9dfg.execute-api.us-east-1.amazonaws.com/stage1/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            headers: {
              Authorization: "Bearer " + localStorage.getItem('jwt')
            },
            body: {
              fileName: file.name,
              fileType: file.type,
            },
            httpMethod: "POST"
          }),
        });
        
        const responseEvent = await res.json();

        // Parse the nested JSON string
        const body = typeof responseEvent.body === 'string'
          ? JSON.parse(responseEvent.body)
          : responseEvent.body;
        
        const signedUrl = body.signedUrl;
        const fileUrl = body.fileUrl;

        console.log("signedUrl " + signedUrl);
        console.log("fileUrl " + fileUrl);
        
        // Step 2: Upload the file to the signed URL
        
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,           // MUST match the type used during URL generation
          },
          body: file,
        });
        
    
        if (!uploadRes.ok) {
          throw new Error('Upload failed');
        }
    
        // Step 3: Use fileUrl as your uploaded public file path
        return fileUrl;
      } catch (err) {
        alert('File upload failed!');
      }
    };

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
    
      if (file.size > 60 * 1024 * 1024) {
        alert("Video must be smaller than 5MB.");
        return;
      }
    
      setUploadedVideo(file);
    };
    
    const submitFormData = async ({
      email,
      mobileNumber,
      location,
      audioUrls,
      photoUrls,
      videoUrls,
      additionalNotes,
    }: {
      email: string;
      mobileNumber: string;
      location: string;
      audioUrls: string[];
      photoUrls: string[];
      videoUrls: string[];
      additionalNotes: string;
    }) => {
      const res = await fetch('https://4ms2bettk2.execute-api.us-east-1.amazonaws.com/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
        body: JSON.stringify({
          email,
          mobile_number: mobileNumber,
          location: location,
          audio_urls: audioUrls,
          photo_urls: photoUrls,
          video_urls: videoUrls,
          additional_notes: additionalNotes,
        }),
      });
      if (!res.ok) throw new Error('Form submission failed');
      return res.json();
    };

    const handleFinalUpload = async () => {
      setIsUploading(true);
      setSuccessMessage('');
      setShowLoader(true); // Show loader overlay

      try {
        // Upload Photos
        const uploadedPhotoUrls = await Promise.all(
          uploadedPhotos.map(async (photo) => {
            return await uploadToS3(photo);
          })
        );

        // Upload Video
        let uploadedVideoUrl: string | null = null;
        if (uploadedVideo) {
          uploadedVideoUrl = await uploadToS3(uploadedVideo);
        }

        // Upload Audio
        let uploadedAudioUrl: string | null = null;
        if (audioUrl) {
          const audioBlob = await fetch(audioUrl).then(res => res.blob());
          const audioFile = new File([audioBlob], 'recording.webm', {
            type: audioBlob.type,
          });
          uploadedAudioUrl = await uploadToS3(audioFile);
        }

        // Call your backend API with all the data
        await submitFormData({
          email,
          mobileNumber,
          location: issueLocation,
          audioUrls: uploadedAudioUrl ? [uploadedAudioUrl] : [],
          photoUrls: uploadedPhotoUrls.filter(Boolean) as string[],
          videoUrls: uploadedVideoUrl ? [uploadedVideoUrl] : [],
          additionalNotes,
        });

        // Clear file states after success
        setAudioUrl(null);
        setUploadedPhotos([]);
        setUploadedVideo(null);
        setSuccessMessage('Files uploaded successfully!');
        setEmail('');
        setAudioUrl('');
        setMobileNumber('');
        setAdditionalNotes('');
        setIssueLocation('');
        setIsUploading(false);
        setRecordingTime('00.00');
        
        // Navigate to thanks page on success
        navigate('/thanks');
      } catch (err) {
        console.error('Upload failed:', err);
        setIsUploading(false);
        setShowLoader(false); // Hide loader on error
      }
    };
    
    

    const handleSuggestionSelect = (item: any) => {
      setIssueLocation(item.display_name);
      setSuggestions([]);
      setShowSuggestions(false);
    };
    

  return (
    <div className="app-container">
      {/* Form Container */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="form">
          {/* Information Upload Header */}
          <div className="form-header">
            <ArrowLeft onClick={() => navigate('/')}/>
            <h2 className="form-title">Information Upload</h2>
          </div>

          {/* Organization info bar - replaced with image */}
        <section className="otp-org-section">
          <img
            className="otp-org-image"
            alt="CCB Anti-Narcotics Bengaluru"
            src="/Frame 1000003741 (1).svg"
          />
        </section>
          
 
          {/* Mobile Number Section */}
          <div className="form-field mobile-input-form">
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
                disabled={isMobileDisabled}
              />
            </div>
            <p className="form-help-text">Your Mobile Number will be kept private and confidential</p>
          </div>

          {/* Email ID Section */}
          {/* <div className="form-field">
            <label className="form-label">E-mail ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email ID"
              className="standard-input"
            />
            <p className="form-help-text">Your Mail ID will be kept private and confidential</p>
          </div> */}

          {/* Issue Location Section */}
          <div className="form-field" style={{ position: 'relative' }}>
            <label className="form-label">Issue Location</label>
            <div className="location-input-container">
              <input
                type="text"
                value={issueLocation}
                onChange={handleLocationChange}
                placeholder="Enter or detect location"
                className="location-input"
                onFocus={() => setShowSuggestions(true)}
              />
              <MapPin
                className="location-icon"
                onClick={detectCurrentLocation}
                style={{ cursor: 'pointer' }}
              />
            </div>
            {loadingLocation && <p style={{ fontSize: '12px' }}>📡 Detecting location...</p>}

            {/* Suggestion Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestion-list">
                {suggestions.map((item, idx) => (
                  <li key={idx} onClick={() => handleSuggestionSelect(item)}>
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
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

            {audioUrl && (
              <div>
                <audio controls src={audioUrl} />
              </div>
            )}
          </div>

          {/* Upload Photo Section */}
          <div className="form-field">
            <label className="form-label">Upload Photos (max 10 MB each)</label>
            <div onClick={() => photoInputRef.current?.click()} className="upload-container">
              <div className="upload-content">
                <ImageIcon />
                <span className="upload-text">Click to upload photos</span>
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="upload-input"
            />
            <div className="preview-grid">
              {uploadedPhotos.map((file, index) => (
                <div className="preview-wrapper" key={index}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`upload-${index}`}
                    className="preview-image"
                  />
                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => {
                      setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Video Section */}
          <div className="form-field">
            <label className="form-label">Upload Video (max 60 MB)</label>
            <div onClick={() => videoInputRef.current?.click()} className="upload-container">
              <div className="upload-content">
                <Video />
                <span className="upload-text">{uploadedVideo?.name || 'Upload Video'}</span>
              </div>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="upload-input"
            />
            {uploadedVideo && (
              <div className="video-preview-wrapper">
                <video controls width="100%">
                  <source src={URL.createObjectURL(uploadedVideo)} type={uploadedVideo.type} />
                  Your browser does not support the video tag.
                </video>
                <button
                  className="remove-button"
                  type="button"
                  onClick={() => setUploadedVideo(null)}
                >
                  &times;
                </button>
              </div>
            )}
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
          <button
            type="button"
            className="submit-button"
            onClick={handleFinalUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Submit'}
          </button>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

        </form>
      </div>
      
      {/* Loader Overlay */}
      {showLoader && (
        <div className="loader-overlay">
          <div className="loader-content">
            <div className="loader-spinner"></div>
            <p className="loader-text">Uploading your information...</p>
          </div>
        </div>
      )}
    </div>
  );

};

export default UploadPage;
