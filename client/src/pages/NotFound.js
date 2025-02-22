// client/src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <Navbar />
      
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="action-buttons">
          <Link to="/" className="home-btn">
            <FaHome />
            <span>Go Home</span>
          </Link>
          <Link to="/search" className="search-btn">
            <FaSearch />
            <span>Search</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .not-found-container {
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .not-found-content {
          max-width: 600px;
          margin: 100px auto 0;
          padding: 40px 20px;
          text-align: center;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .error-code {
          font-size: 120px;
          font-weight: bold;
          color: #ff6b6b;
          line-height: 1;
          margin-bottom: 20px;
        }

        h1 {
          margin: 0 0 15px;
          color: #333;
          font-size: 24px;
        }

        p {
          margin: 0 0 30px;
          color: #666;
          font-size: 16px;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .home-btn,
        .search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
        }

        .home-btn {
          background-color: #ff6b6b;
          color: white;
        }

        .home-btn:hover {
          background-color: #ff5252;
        }

        .search-btn {
          background-color: #f0f0f0;
          color: #333;
        }

        .search-btn:hover {
          background-color: #e0e0e0;
        }

        @media (max-width: 480px) {
          .action-buttons {
            flex-direction: column;
          }

          .not-found-content {
            margin-top: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;