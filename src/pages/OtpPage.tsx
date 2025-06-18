import { ArrowLeftIcon, ShieldIcon } from "lucide-react";
import { useState, type JSX } from "react";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/input-otp";
import "./OtpPage.css";

export const OtpPage = (): JSX.Element => {
  // Data for OTP inputs
  const otpSlots = [1, 2, 3, 4];
  
  // State for OTP value
  const [otp, setOtp] = useState('');

  return (
    <div className="otp-container">
      <div className="otp-mobile-frame">
        {/* Header with language selection */}
        <header className="otp-header">
          <div className="otp-language-bar">
            <span className="otp-language-text">
              Kannada
            </span>
          </div>
        </header>

        {/* Organization info bar - replaced with image */}
        <section className="otp-org-section">
          <img
            className="otp-org-image"
            alt="CCB Anti-Narcotics Bengaluru"
            src="/Frame 1000003741 (1).svg"
          />
        </section>

        {/* Main content */}
        <main className="otp-main-content">
          {/* Report Activity header */}
          <div className="otp-report-header">
            <div className="otp-title-section">
              <ArrowLeftIcon className="otp-back-icon" />
              <h1 className="otp-title">
                Report Activity
              </h1>
            </div>

            {/* Security notice */}
            <Card className="otp-security-card">
              <CardContent className="otp-security-content">
                <ShieldIcon className="otp-shield-icon" />
                <p className="otp-security-text">
                  <span className="otp-security-normal">
                    Your identity will remain completely{" "}
                  </span>
                  <span className="otp-security-bold">anonymous.</span>
                  <span className="otp-security-normal">
                    {" "}
                    Your phone number will never be shared or used to contact
                    you.
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile number input */}
          <div className="otp-mobile-section">
            <label className="otp-mobile-label">
              Mobile number
            </label>
            <div className="otp-mobile-input-container">
              <div className="otp-country-code">
                <div className="otp-country-code-text">
                  +91
                </div>
              </div>
              <Input
                className="otp-mobile-input px-2"
                aria-label="Phone number"
              />
            </div>
          </div>

          {/* Send OTP button */}
          <Button
            className="otp-send-button"
            disabled
          >
            <span className="otp-button-text">
              Send OTP
            </span>
          </Button>

          {/* OTP input section */}
          <div className="otp-input-section">
            <div className="otp-input-container">
              <div className="otp-input-wrapper">
                <label className="otp-input-label">
                  OTP
                </label>
                <InputOTP
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
              </div>
            </div>
          </div>

          {/* Next button */}
          <Button
            className="otp-next-button"
            disabled
          >
            <span className="otp-button-text">
              Next
            </span>
          </Button>
        </main>
      </div>
    </div>
  );
};