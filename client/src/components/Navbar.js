// client/src/components/Navbar.js
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FaSearch, 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaBars,
  FaTimes,
  FaUtensils
} from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Focus search input when search bar is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <FaUtensils className="logo-icon" />
            <span>FoodShare</span>
          </Link>
        </div>
        
        <div className="navbar-center">
          {showSearch ? (
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search for restaurants, dishes, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={searchInputRef}
              />
              <button type="button" onClick={() => setShowSearch(false)}>
                <FaTimes />
              </button>
            </form>
          ) : (
            <div className="navbar-links desktop-only">
              <Link to="/" className="nav-link">
                <FaHome />
                <span>Home</span>
              </Link>
              <button
                className="nav-link search-btn"
                onClick={() => setShowSearch(true)}
              >
                <FaSearch />
                <span>Search</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-section">
              <div
                className="user-profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={user.username}
                  className="user-avatar"
                />
              </div>
              
              {showUserMenu && (
                <div className="user-menu" ref={userMenuRef}>
                  <Link
                    to={`/profile/${user._id}`}
                    className="menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser />
                    <span>Profile</span>
                  </Link>
                  <button className="menu-item logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons desktop-only">
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </div>
          )}
          
          <div className="mobile-menu-toggle">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <FaBars />
            </button>
          </div>
        </div>
      </div>
      
      {showMobileMenu && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <div className="mobile-menu-header">
            <button
              className="close-menu-btn"
              onClick={() => setShowMobileMenu(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="mobile-menu-content">
            <Link
              to="/"
              className="mobile-menu-item"
              onClick={() => setShowMobileMenu(false)}
            >
              <FaHome />
              <span>Home</span>
            </Link>
            
            <button
              className="mobile-menu-item"
              onClick={() => {
                setShowSearch(true);
                setShowMobileMenu(false);
              }}
            >
              <FaSearch />
              <span>Search</span>
            </button>
            
            {isAuthenticated ? (
              <>
                <Link
                  to={`/profile/${user._id}`}
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FaUser />
                  <span>Profile</span>
                </Link>
                
                <button className="mobile-menu-item" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span>Login</span>
                </Link>
                
                <Link
                  to="/register"
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: white;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbar-left {
          display: flex;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #ff6b6b;
          font-weight: 700;
          font-size: 20px;
        }

        .logo-icon {
          margin-right: 8px;
        }

        .navbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
          max-width: 600px;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          color: #666;
          padding: 8px 12px;
          border-radius: 5px;
          transition: all 0.3s;
        }

        .nav-link:hover {
          background-color: #f5f5f5;
          color: #ff6b6b;
        }

        .search-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .search-form {
          display: flex;
          align-items: center;
          width: 100%;
          background-color: #f5f5f5;
          border-radius: 20px;
          padding: 5px 15px;
        }

        .search-form input {
          flex: 1;
          border: none;
          background: none;
          padding: 8px 10px;
          font-size: 16px;
          outline: none;
        }

        .search-form button {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 5px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-btn {
          text-decoration: none;
          color: #ff6b6b;
          padding: 8px 15px;
          border-radius: 5px;
          transition: all 0.3s;
        }

        .login-btn:hover {
          background-color: #ffefef;
        }

        .register-btn {
          text-decoration: none;
          color: white;
          background-color: #ff6b6b;
          padding: 8px 15px;
          border-radius: 5px;
          transition: all 0.3s;
        }

        .register-btn:hover {
          background-color: #ff5252;
        }

        .user-section {
          position: relative;
        }

        .user-profile {
          cursor: pointer;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-menu {
          position: absolute;
          top: 45px;
          right: 0;
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          width: 180px;
          z-index: 10;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          text-decoration: none;
          color: #333;
          transition: background-color 0.3s;
        }

        .menu-item:hover {
          background-color: #f5f5f5;
        }

        .logout-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #e41e3f;
        }

        .mobile-menu-toggle {
          display: none;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: white;
          z-index: 200;
          flex-direction: column;
          padding: 20px;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }

        .close-menu-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #333;
          cursor: pointer;
        }

        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          text-decoration: none;
          color: #333;
          font-size: 18px;
          border-radius: 5px;
          transition: background-color 0.3s;
        }

        .mobile-menu-item:hover {
          background-color: #f5f5f5;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-menu-toggle button {
            background: none;
            border: none;
            font-size: 24px;
            color: #333;
            cursor: pointer;
          }

          .mobile-menu {
            display: flex;
          }

          .navbar-center {
            justify-content: flex-start;
          }

          .search-form {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            border-radius: 0;
            padding: 0 20px;
            z-index: 300;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;