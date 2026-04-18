import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface AuthModalProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  registerUsername: string;
  setRegisterUsername: (username: string) => void;
  registerEmail: string;
  setRegisterEmail: (email: string) => void;
  registerPassword: string;
  setRegisterPassword: (password: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  showOtpInput: boolean;
  error: string;
  isLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
  onRegister: (e: React.FormEvent) => void;
  onVerifyOtp: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  onGuestContinue: () => void;
  // PROPS FOR FORGOT PASSWORD
  onForgotPassword?: () => void;
  showForgotPassword?: boolean;
  forgotPasswordEmail?: string;
  setForgotPasswordEmail?: (email: string) => void;
  onSendResetOtp?: (e: React.FormEvent) => void;
  onBackToLogin?: () => void;
  showResetPassword?: boolean;
  resetPasswordOtp?: string;
  setResetPasswordOtp?: (otp: string) => void;
  newPassword?: string;
  setNewPassword?: (password: string) => void;
  onResetPassword?: (e: React.FormEvent) => void;
  isResettingPassword?: boolean;
}

export function AuthModal({ 
  mode, 
  onModeChange,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  registerUsername,
  setRegisterUsername,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  otp,
  setOtp,
  showOtpInput,
  error,
  isLoading,
  onLogin,
  onRegister,
  onVerifyOtp,
  onResendOtp,
  onGuestContinue,
  // PROPS
  onForgotPassword = () => {},
  showForgotPassword = false,
  forgotPasswordEmail = "",
  setForgotPasswordEmail = () => {},
  onSendResetOtp = () => {},
  onBackToLogin = () => {},
  showResetPassword = false,
  resetPasswordOtp = "",
  setResetPasswordOtp = () => {},
  newPassword = "",
  setNewPassword = () => {},
  onResetPassword = () => {},
  isResettingPassword = false,
}: AuthModalProps) {
  
  const [localShowForgot, setLocalShowForgot] = useState(false);
  const [fadeState, setFadeState] = useState<"enter" | "exit" | "">("");
  const [currentForm, setCurrentForm] = useState<string>("login");

  // Determine which form to show
  const getFormType = () => {
    if (showOtpInput) return "otp";
    if (showResetPassword) return "reset";
    if (showForgotPassword || localShowForgot) return "forgot";
    return mode;
  };

  const formType = getFormType();

  // Handle form transitions with fade
  const transitionToForm = (newForm: string, callback?: () => void) => {
    setFadeState("exit");
    setTimeout(() => {
      if (callback) callback();
      setFadeState("enter");
      setTimeout(() => setFadeState(""), 300);
    }, 200);
  };

  // Handle mode change with transition
  const handleModeChange = (newMode: "login" | "register") => {
    transitionToForm(newMode, () => {
      onModeChange(newMode);
      setOtp("");
    });
  };

  // Handle forgot password click
  const handleForgotPasswordClick = () => {
    transitionToForm("forgot", () => {
      setLocalShowForgot(true);
      onForgotPassword();
    });
  };

  // Handle back to login
  const handleBackToLogin = () => {
    transitionToForm("login", () => {
      setLocalShowForgot(false);
      onBackToLogin();
    });
  };

  // Handle send OTP
  const handleSendResetOtp = (e: React.FormEvent) => {
    transitionToForm("reset", () => {
      onSendResetOtp(e);
    });
  };

  // Handle reset password
  const handleResetPassword = (e: React.FormEvent) => {
    transitionToForm("login", () => {
      onResetPassword(e);
    });
  };

  // Render the appropriate form with fade animation
  const renderForm = () => {
    // OTP Verification Form
    if (formType === "otp") {
      return (
        <div className={`auth-form-container ${fadeState}`}>
          <h2>Verify Your Email</h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Please enter the 6-digit OTP sent to your email
          </p>
          {error && (
            <div className="auth-error" style={{ 
              background: error.includes("sent") ? '#e8f5e9' : '#fee2e2',
              color: error.includes("sent") ? '#2e7d32' : '#dc2626'
            }}>
              {error}
            </div>
          )}
          <form onSubmit={onVerifyOtp}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }}
            />
            <button type="submit" className="play-button" disabled={isLoading}>
              {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : "Verify OTP"}
            </button>
          </form>
          <button 
            onClick={onResendOtp} 
            className="guest-button" 
            style={{ marginTop: '12px' }}
            disabled={isLoading}
          >
            Resend OTP
          </button>
          <button 
            onClick={() => handleModeChange("register")} 
            className="guest-button" 
            style={{ marginTop: '8px' }}
          >
            Back to Registration
          </button>
        </div>
      );
    }

    // Reset Password Form
    if (formType === "reset") {
      return (
        <div className={`auth-form-container ${fadeState}`}>
          <h2>Reset Password</h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Enter the OTP sent to {forgotPasswordEmail}
          </p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={resetPasswordOtp}
              onChange={(e) => setResetPasswordOtp(e.target.value)}
              maxLength={6}
              required
              style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }}
            />
            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <button type="submit" className="play-button" disabled={isResettingPassword}>
              {isResettingPassword ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : "Reset Password"}
            </button>
          </form>
          <button 
            onClick={handleBackToLogin} 
            className="guest-button" 
            style={{ marginTop: '12px' }}
          >
            Back to Login
          </button>
        </div>
      );
    }

    // Forgot Password Form
    if (formType === "forgot") {
      return (
        <div className={`auth-form-container ${fadeState}`}>
          <h2>Forgot Password</h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Enter your email to receive a password reset OTP
          </p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSendResetOtp}>
            <input 
              type="email" 
              placeholder="Email" 
              value={forgotPasswordEmail} 
              onChange={(e) => setForgotPasswordEmail(e.target.value)} 
              required 
            />
            <button type="submit" className="play-button" disabled={isLoading}>
              {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : "Send OTP"}
            </button>
          </form>
          <button 
            onClick={handleBackToLogin} 
            className="guest-button" 
            style={{ marginTop: '12px' }}
          >
            Back to Login
          </button>
        </div>
      );
    }

    // Login/Register Form
    return (
      <div className={`auth-form-container ${fadeState}`}>
        <h2>{mode === "login" ? "Login to Frozen Beats" : "Create Account"}</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={mode === "login" ? onLogin : onRegister}>
          {mode === "register" && (
            <input 
              type="text" 
              placeholder="Username" 
              value={registerUsername} 
              onChange={(e) => setRegisterUsername(e.target.value)} 
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={mode === "login" ? loginEmail : registerEmail} 
            onChange={(e) => mode === "login" ? setLoginEmail(e.target.value) : setRegisterEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={mode === "login" ? loginPassword : registerPassword} 
            onChange={(e) => mode === "login" ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="play-button" disabled={isLoading}>
            {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (mode === "login" ? "Login" : "Register")}
          </button>
        </form>
        
        {/* Forgot Password Link - Only show on login mode */}
        {mode === "login" && (
          <p className="auth-switch" style={{ justifyContent: 'center', marginTop: '8px' }}>
            <button 
              onClick={handleForgotPasswordClick} 
              style={{ color: '#666', fontSize: '14px' }}
            >
              Forgot Password?
            </button>
          </p>
        )}
        
        <p className="auth-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => handleModeChange(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
        <button onClick={onGuestContinue} className="guest-button">Continue as Guest</button>
      </div>
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card frozen-card">
        {renderForm()}
      </div>
    </div>
  );
}