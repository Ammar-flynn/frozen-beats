import { useState, useEffect } from "react";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setAuthError(data.error || 'Login failed');
        return false;
      }
      
      const token = data.token;
      localStorage.setItem('token', token);
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      setUser({ 
        userId: payload.userId, 
        role: payload.role,
        username: payload.username
      });
      
      setIsLoggedIn(true);
      return true;
      
    } catch (err) {
      setAuthError('Login failed. Please try again.');
      console.error(err);
      return false;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: registerUsername, 
          email: registerEmail, 
          password: registerPassword 
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        setAuthError(error.error || 'Registration failed');
        return false;
      }
      
      setAuthMode("login");
      setLoginEmail(registerEmail);
      setLoginPassword(registerPassword);
      return true;
      
    } catch (err) {
      setAuthError('Registration failed. Please try again.');
      console.error(err);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setRegisterUsername("");
    setRegisterEmail("");
    setRegisterPassword("");
    setAuthError("");
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && typeof token === 'string' && token.split('.').length === 3) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ 
          userId: payload.userId, 
          role: payload.role,
          username: payload.username 
        });
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Token decode error:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

  return {
    isLoggedIn,
    user,
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
    authError,
    authMode,
    setAuthMode,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}