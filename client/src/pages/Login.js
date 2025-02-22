// client/src/pages/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;
  
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clear any errors
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-form-header">
          <h1>Food Share</h1>
          <p>Welcome back!</p>
        </div>
        
        {error && <div className="alert-error">{error}</div>}
        
        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Email Address"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Register
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .login-form-container {
          width: 100%;
          max-width: 400px;
          padding: 30px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .login-form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-form-header h1 {
          color: #ff6b6b;
          margin-bottom: 10px;
        }

        .alert-error {
          background-color: #ffe3e3;
          color: #e41e3f;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #999;
        }

        input {
          width: 100%;
          padding: 15px 15px 15px 45px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        input:focus {
          border-color: #ff6b6b;
          outline: none;
        }

        .show-password-btn {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .login-btn:hover {
          background-color: #ff5252;
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
        }

        .register-link {
          color: #ff6b6b;
          text-decoration: none;
          font-weight: bold;
        }

        .register-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;