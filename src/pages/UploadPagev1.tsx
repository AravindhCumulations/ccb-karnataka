// Imports
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
import AppHeader from '../components/AppHeader';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// UploadPage component
const UploadPage: React.FC = () => {
  // --- State ---
  const navigate = useNavigate();
  const location = useLocation();
  const initialMobileNumber = location.state?.mobileNumber || '';
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [email, setEmail] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [isRecording, setIsRecording] = useState(false);
  const [audioFileObj, setAudioFileObj] = useState<{
    file: File;
    url: string;
    signedUrl: string;
    fileUrl: string;
    progress: number;
  } | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<{
    file: File;
    signedUrl: string;
    fileUrl: string;
    progress: number;
  }[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<{
    file: File;
    signedUrl: string;
    fileUrl: string;
    progress: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [photoProgress, setPhotoProgress] = useState<number[]>([]);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const { t } = useTranslation();
  const [showSuccessTick, setShowSuccessTick] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!isValidJwt(token)) {
      navigate('/', { replace: true });
    }
  }, []);

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

  // Auto-dismiss snackbar after 4 seconds
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar({ open: false, message: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // --- Handlers ---
  const getSignedUrl = async (file: File) => {
    if(!isValidJwt(localStorage.getItem('jwt'))) {
      setSnackbar({ open: true, message: 'Otp expired' });
      navigate('/otp', { replace: true });
      return null;
    }
    const res = await fetch('https://erbmnx9dfg.execute-api.us-east-1.amazonaws.com/stage1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headers: { Authorization: "Bearer " + localStorage.getItem('jwt') },
        body: { fileName: file.name, fileType: file.type },
        httpMethod: "POST"
      }),
    });
    const data = await res.json();
    if (data.statusCode === 401) {
      try {
        if (data && data.body) {
          setSnackbar({ open: true, message: JSON.parse(data.body).error });
          navigate('/otp', { replace: true });
        }
      } catch {}
      return null;
    }
    const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    return { signedUrl: body.signedUrl, fileUrl: body.fileUrl };
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB
    if (validFiles.length !== files.length) {
      setSnackbar({ open: true, message: "Some images were too large (max 10MB). Only smaller images are accepted." });
    }
    // Generate signed URLs for each valid file
    const photoObjs = await Promise.all(validFiles.map(async (file) => {
      const signed = await getSignedUrl(file);
      if (!signed) return null;
      return { file, signedUrl: signed.signedUrl, fileUrl: signed.fileUrl, progress: 0 };
    }));
    setUploadedPhotos(prev => {
      const newPhotos = [...prev, ...photoObjs.filter(Boolean) as any];
      console.log('[STATE] setUploadedPhotos:', newPhotos);
      return newPhotos;
    });
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      setSnackbar({ open: true, message: "Video must be smaller than 5MB." });
      return;
    }
    const signed = await getSignedUrl(file);
    if (!signed) return;
    const videoObj = { file, signedUrl: signed.signedUrl, fileUrl: signed.fileUrl, progress: 0 };
    setUploadedVideo(() => {
      console.log('[STATE] setUploadedVideo:', videoObj);
      return videoObj;
    });
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssueLocation(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        setSnackbar({ open: true, message: 'Microphone access denied or not supported' });
      }
    } else {
      setIsRecording(false);
      recorderRef.current.stopRecording(async () => {
        const blob = recorderRef.current.getBlob();
        const url = URL.createObjectURL(blob);
        const file = new File([blob], 'recording.webm', { type: blob.type });
        // Generate signed URL for audio immediately
        const signed = await getSignedUrl(file);
        if (!signed) {
          setSnackbar({ open: true, message: 'Failed to get signed URL for audio.' });
          setAudioFileObj(null);
          return;
        }
        const audioObj = { file, url, signedUrl: signed.signedUrl, fileUrl: signed.fileUrl, progress: 0 };
        setAudioFileObj(() => {
          console.log('[STATE] setAudioFileObj:', audioObj);
          return audioObj;
        });
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
  };

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
            setIssueLocation(`${data?.address?.suburb || ''} ${data?.address?.city || ''} ${data?.address?.state || ''}`);
          }
        } catch (error) {
          setSnackbar({ open: true, message: 'Reverse geocoding failed.' });
          console.error('Reverse geocoding failed:', error);
          setIssueLocation(`${latitude}, ${longitude}`);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        setSnackbar({ open: true, message: 'Unable to access location. Please enable GPS.' });
        console.error('Geolocation failed:', error);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // --- Upload Logic ---
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
      headers: { 'Content-Type': 'application/json' },
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

  // --- Main Upload Handler ---
  const handleFinalUpload = async () => {
    setIsUploading(true);
    setSuccessMessage('');
    setShowLoader(true);
    setShowSuccessTick(false);
    try {
      // Photos
      const photoProgressArr = Array(uploadedPhotos.length).fill(0);
      setPhotoProgress(photoProgressArr);
      const uploadedPhotoUrls: string[] = [];
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const { file, signedUrl, fileUrl } = uploadedPhotos[i];
        console.log('[UPLOAD] Photo:', { signedUrl, fileUrl });
        await axios.put(signedUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setPhotoProgress(prev => {
                const updated = [...prev];
                updated[i] = percent;
                return updated;
              });
            }
          }
        });
        uploadedPhotoUrls.push(fileUrl);
      }
      // Video
      let uploadedVideoUrl = '';
      if (uploadedVideo) {
        setVideoProgress(0);
        console.log('[UPLOAD] Video:', { signedUrl: uploadedVideo.signedUrl, fileUrl: uploadedVideo.fileUrl });
        await axios.put(uploadedVideo.signedUrl, uploadedVideo.file, {
          headers: { 'Content-Type': uploadedVideo.file.type },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setVideoProgress(percent);
            }
          }
        });
        uploadedVideoUrl = uploadedVideo.fileUrl;
      }
      // Audio
      let uploadedAudioUrl: string = '';
      if (audioFileObj) {
        setAudioProgress(0);
        console.log('[UPLOAD] Audio:', { signedUrl: audioFileObj.signedUrl, fileUrl: audioFileObj.fileUrl });
        await axios.put(audioFileObj.signedUrl, audioFileObj.file, {
          headers: { 'Content-Type': audioFileObj.file.type },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setAudioProgress(percent);
            }
          }
        });
        uploadedAudioUrl = audioFileObj.fileUrl;
      }
      await submitFormData({
        email,
        mobileNumber,
        location: issueLocation,
        audioUrls: uploadedAudioUrl ? [uploadedAudioUrl] : [],
        photoUrls: uploadedPhotoUrls,
        videoUrls: uploadedVideoUrl ? [uploadedVideoUrl] : [],
        additionalNotes,
      });
      setAudioFileObj(null);
      setUploadedPhotos([]);
      setUploadedVideo(null);
      setSuccessMessage('Files uploaded successfully!');
      setEmail('');
      setMobileNumber('');
      setAdditionalNotes('');
      setIssueLocation('');
      setIsUploading(false);
      setRecordingTime('00.00');
      setPhotoProgress([]);
      setAudioProgress(0);
      setVideoProgress(0);
      // Show tick, then navigate
      setShowSuccessTick(true);
      setTimeout(() => {
        setShowLoader(false);
        setShowSuccessTick(false);
        navigate('/thanks');
      }, 2000);
      return;
    } catch (err: any) {
      setIsUploading(false);
      setShowLoader(false);
      setSnackbar({ open: true, message: err?.message || 'Upload failed. Please try again.' });
    }
  };

  // --- Utility ---
  function isValidJwt(token: string | null): boolean {
    if (!token) return false;
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      const now = Math.floor(Date.now() / 1000);
      console.log(exp, now);
      return exp > now;
    } catch {
      return false;
    }
  }

  // Snackbar close handler
  const closeSnackbar = () => setSnackbar({ open: false, message: '' });

  // --- Render ---
  return (
    <div className="app-container">
      {/* Form Container */}
      <div className="form-container">
        {/* Header with language selection */}
        <AppHeader />
      
        <form onSubmit={handleSubmit} className="form">
          {/* Information Upload Header */}
          <div className="form-header">
            <ArrowLeft onClick={() => navigate('/')}/>
            <h2 className="form-title">{t('information_upload')}</h2>
          </div>

          {/* Issue Location Section */}
          <div className="form-field" style={{ position: 'relative' }}>
            <label className="form-label">{t('issue_location')}</label>
            <div className="location-input-container">
              <input
                type="text"
                value={issueLocation}
                onChange={handleLocationChange}
                placeholder={t('enter_or_detect_location')}
                className="location-input"
              />
              <MapPin
                className="location-icon"
                onClick={detectCurrentLocation}
                style={{ cursor: 'pointer' }}
              />
            </div>
            {loadingLocation && <p style={{ fontSize: '12px' }}>{t('detecting_location')}</p>}
          </div>

          {/* Voice Note Section */}
          <div className="form-field">
            <label className="form-label">{t('voice_note')}</label>
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
            {audioFileObj && (
              <div>
                <audio controls src={audioFileObj.url} />
              </div>
            )}
          </div>

          {/* Upload Photo Section */}
          <div className="form-field">
            <label className="form-label">{t('upload_photos')}</label>
            <div onClick={() => photoInputRef.current?.click()} className="upload-container">
              <div className="upload-content">
                <ImageIcon />
                <span className="upload-text">{t('click_to_upload_photos')}</span>
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
              {uploadedPhotos.map(({ file }, index) => (
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
            <label className="form-label">{t('upload_video')}</label>
            <div onClick={() => videoInputRef.current?.click()} className="upload-container">
              <div className="upload-content">
                <Video />
                <span className="upload-text">{uploadedVideo?.file.name || t('upload_video_text')}</span>
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
                  <source src={URL.createObjectURL(uploadedVideo.file)} type={uploadedVideo.file.type} />
                  {t('video_not_supported')}
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
            <label className="form-label">{t('additional_notes')}</label>
            <div className="notes-container">
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={t('enter_additional_notes')}
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
            {isUploading ? t('uploading') : t('submit')}
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
            {showSuccessTick ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 50 }}>
                  <svg width="50" height="50" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="30" r="28" stroke="#263588" strokeWidth="4" fill="#f3f3f3" />
                    <path d="M18 32L27 41L43 23" stroke="#263588" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="loader-text" style={{ color: '#263588', fontWeight: 600, fontSize: 18, fontFamily: 'Inter, sans-serif' }}>{t('upload_success')}</p>
              </>
            ) : (
              <>
                <div className="loader-spinner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 50 }}></div>
                <p className="loader-text" style={{ fontFamily: 'Inter, sans-serif' }}>{t('uploading_info')}</p>
                {/* Upload progress details */}
                <div style={{ marginTop: '16px', textAlign: 'left', width: 280, fontFamily: 'Inter, sans-serif' }}>
                  {/* Photos Progress */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold', color: '#263588', minWidth: 60 }}>{t('photos')}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#263588' }}>{photoProgress.length > 0 ? Math.round(photoProgress.reduce((a, b) => a + b, 0) / photoProgress.length) : 0}%</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${photoProgress.length > 0 ? Math.round(photoProgress.reduce((a, b) => a + b, 0) / photoProgress.length) : 0}%`, height: '100%', background: '#263588', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                  {/* Video Progress */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold', color: '#263588', minWidth: 60 }}>{t('video')}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#263588' }}>{videoProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${videoProgress}%`, height: '100%', background: '#263588', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                  {/* Audio Progress */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold', color: '#263588', minWidth: 60 }}>{t('audio')}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#263588' }}>{audioProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${audioProgress}%`, height: '100%', background: '#263588', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Snackbar Popup */}
      {snackbar.open && (
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          margin: '0 auto',
          zIndex: 2000,
          width: 'fit-content',
          minWidth: 240,
          maxWidth: 400,
          background: '#323232',
          color: 'white',
          borderRadius: 8,
          padding: '16px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          textAlign: 'center',
          fontSize: 16,
          marginBottom: 32,
          animation: 'fadeInUp 0.3s',
        }}
        onClick={closeSnackbar}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
