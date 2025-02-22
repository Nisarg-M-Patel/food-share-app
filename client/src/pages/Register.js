// client/src/pages/Register.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { username, email, password, password2 } = formData;
  
  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formError, setFormError] = useState('');

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
    // Clear form errors when typing
    setFormError('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== password2) {
      setFormError('Passwords do not match');
      return;
    }
    
    // Check password length
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    register({ username, email, password });
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <div className="register-form-header">
          <h1>Food Share</h1>
          <p>Create your account</p>
        </div>
        
        {(error || formError) && (
          <div className="alert-error">{formError || error}</div>
        )}
        
        <form onSubmit={onSubmit} className="register-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                placeholder="Username"
                required
              />
            </div>
          </div>
          
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
          
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password2"
                value={password2}
                onChange={onChange}
                placeholder="Confirm Password"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="register-btn">
            Register
          </button>
        </form>
        
        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .register-form-container {
          width: 100%;
          max-width: 400px;
          padding: 30px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .register-form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-form-header h1 {
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

        .register-btn {
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

        .register-btn:hover {
          background-color: #ff5252;
        }

        .register-footer {
          text-align: center;
          margin-top: 20px;
        }

        .login-link {
          color: #ff6b6b;
          text-decoration: none;
          font-weight: bold;
        }

        .login-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Register;