import { ArrowLeftIcon, ShieldIcon } from "lucide-react";
import React, { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/input-otp";
import "./OtpPage.css";
import AppHeader from "../components/AppHeader";
import { useTranslation } from 'react-i18next';

export const OtpPage = (): JSX.Element => {
  // Data for OTP inputs
  const otpSlots = [1, 2, 3, 4];
  
  // State for OTP value
  const [otp, setOtp] = useState('');
  // State for mobile number input
  const [mobileNumber, setMobileNumber] = useState('');
  // State for Send OTP button disabled and timer
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Timer effect for cooldown
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Validate mobile number (simple 10 digit check)
  const isMobileValid = /^\d{10}$/.test(mobileNumber);

  // Validate OTP (4 digits)
  const isOtpValid = /^\d{4}$/.test(otp);

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!isMobileValid || isSending || cooldown > 0) return;
    setIsSending(true);
    setCooldown(60);
    const body = { mobileNumber };
    console.log('Sending OTP request:', body);
    try {
      const response = await fetch('https://rt9aw69d52.execute-api.us-east-1.amazonaws.com/v1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log('OTP API response:', data);
    } catch (error) {
      console.error('OTP API error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Send entered OTP to verify endpoint
  const handleVerifyOtp = async () => {
    if (!isMobileValid || !isOtpValid) return;
    setError('');
    setIsVerifying(true);
    console.log(mobileNumber);
    const body = { mobileNumber, otp };
    console.log('Verifying OTP:', body);
    try {
      const response = await fetch('https://7tsu1yfegg.execute-api.us-east-1.amazonaws.com/v1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      // const response = await fetch('https://7tsu1yfegg.execute-api.us-east-1.amazonaws.com/v1/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify(body),
      // });

      const responseData = await response.json();
      console.log("response status code " + responseData.statusCode);
      if (responseData.statusCode === 200) {
        const data = responseData;
        console.log('OTP verification response:', data);
        if (data.body) {
          const jwt = JSON.parse(data.body)
          localStorage.setItem('jwt', jwt.jwt);
          navigate('/upload', { state: { mobileNumber } });
        } else {
          console.error('No token found in response');
          setError('An unexpected error occurred.');
        }
      } else if (responseData.statusCode === 401) {
        setError('Invalid OTP. Please try again.');
      } else {
        console.error('OTP verification failed with status:', response.status);
        setError('An unexpected error occurred.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Failed to verify OTP. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-mobile-frame">
        <AppHeader />

        {/* Main content */}
        <main className="otp-main-content">
          {/* Report Activity header */}
          <div className="otp-report-header">
            <div className="otp-title-section">
              <ArrowLeftIcon className="otp-back-icon" onClick={() => navigate('/')} />
              <h1 className="otp-title">
                {t('report_activity')}
              </h1>
            </div>

            {/* Security notice */}
            <Card className="otp-security-card">
              <CardContent className="otp-security-content">
                <ShieldIcon className="otp-shield-icon" />
                <p className="otp-security-text">
                  <span className="otp-security-normal">
                    {t('identity_remain')}
                  </span>
                  <span className="otp-security-bold">{t('anonymous')}</span>
                  <span className="otp-security-normal">
                    {t('phone_never_shared')}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile number input */}
          <div className="otp-mobile-section">
            <label className="otp-mobile-label">
              {t('mobile_number')}
            </label>
            <div className="otp-mobile-input-container">
              <div className="otp-country-code">
                <div className="otp-country-code-text">
                  +91
                </div>
              </div>
              <Input
                type="password"
                className="otp-mobile-input px-2"
                aria-label={t('phone_number_aria')}
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder={t('enter_10_digit')}
                maxLength={10}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Send OTP button */}
          <Button
            className={`otp-send-button${isMobileValid && !isSending && cooldown === 0 ? ' enabled' : ''}`}
            onClick={handleSendOtp}
            disabled={!isMobileValid || isSending || cooldown > 0}
          >
            <span className="otp-button-text">
              {cooldown > 0 ? t('resend_otp_in', { cooldown }) : t('send_otp')}
            </span>
          </Button>

          {/* OTP input section */}
          <div className="otp-input-section">
            <div className="otp-input-container">
              <div className="otp-input-wrapper">
                <label className="otp-input-label">
                  {t('otp')}
                </label>
                <InputOTP
                  type="password"
                  maxLength={4}
                  value={otp}
                  onChange={setOtp}
                  className="otp-input-field"
                >
                  <InputOTPGroup className="otp-input-group">
                    {otpSlots.map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="otp-slot"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {error && <p className="otp-error-text">{t(error)}</p>}
              </div>
            </div>
          </div>

          {/* Next button */}
          <Button
            className={`otp-next-button${isMobileValid && isOtpValid && !isVerifying ? ' enabled' : ''}`}
            onClick={handleVerifyOtp}
            disabled={!isMobileValid || !isOtpValid || isVerifying}
          >
            <span className="otp-button-text">
              {isVerifying ? t('verifying') : t('next')}
            </span>
          </Button>
        </main>
      </div>
    </div>
  );
};