// client/src/pages/Search.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostItem from '../components/PostItem';
import { FaUser, FaUtensils, FaMapMarkerAlt } from 'react-icons/fa';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const requests = [];
        
        // Always fetch both restaurants and users
        requests.push(axios.get(`/api/restaurants/search?query=${query}`));
        requests.push(axios.get(`/api/users/search?query=${query}`));
        
        const [restaurantsRes, usersRes] = await Promise.all(requests);
        
        setRestaurants(restaurantsRes.data.data);
        setUsers(usersRes.data.data);
      } catch (err) {
        setError('Error fetching search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="search-page">
      <Navbar />
      
      <div className="search-content">
        <div className="search-header">
          <h1>Search Results</h1>
          {query && <p>Showing results for "{query}"</p>}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="search-tabs">
          <button
            className={`tab ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            <FaUtensils />
            <span>Restaurants ({restaurants.length})</span>
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUser />
            <span>Users ({users.length})</span>
          </button>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        ) : (
          <div className="search-results">
            {activeTab === 'restaurants' && (
              <div className="restaurants-results">
                {restaurants.length > 0 ? (
                  restaurants.map(restaurant => (
                    <Link
                      to={`/restaurant/${restaurant._id}`}
                      key={restaurant._id}
                      className="restaurant-card"
                    >
                      {restaurant.images && restaurant.images.length > 0 ? (
                        <img
                          src={restaurant.images[0]}
                          alt={restaurant.name}
                          className="restaurant-image"
                        />
                      ) : (
                        <div className="restaurant-image-placeholder">
                          <FaUtensils />
                        </div>
                      )}
                      
                      <div className="restaurant-info">
                        <h3>{restaurant.name}</h3>
                        {restaurant.address && (
                          <p className="restaurant-address">
                            <FaMapMarkerAlt />
                            <span>
                              {restaurant.address.city}, {restaurant.address.state}
                            </span>
                          </p>
                        )}
                        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                          <div className="cuisine-tags">
                            {restaurant.cuisine.map((type, index) => (
                              <span key={index} className="cuisine-tag">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No restaurants found</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="users-results">
                {users.length > 0 ? (
                  users.map(user => (
                    <Link
                      to={`/profile/${user._id}`}
                      key={user._id}
                      className="user-card"
                    >
                      <img
                        src={user.profilePicture || '/default-avatar.png'}
                        alt={user.username}
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <h3>{user.username}</h3>
                        {user.bio && <p className="user-bio">{user.bio}</p>}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .search-content {
          max-width: 800px;
          margin: 80px auto 30px;
          padding: 0 20px;
        }

        .search-header {
          margin-bottom: 30px;
        }

        .search-header h1 {
          margin: 0 0 10px;
          color: #333;
        }

        .search-header p {
          color: #666;
          margin: 0;
        }

        .error-message {
          background-color: #ffe3e3;
          color: #e41e3f;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .search-tabs {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #666;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }

        .tab.active {
          color: #ff6b6b;
          border-bottom-color: #ff6b6b;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 50px 0;
          color: #666;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 107, 107, 0.3);
          border-radius: 50%;
          border-top-color: #ff6b6b;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .restaurant-card {
          display: flex;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s;
        }

        .restaurant-card:hover {
          transform: translateY(-2px);
        }

        .restaurant-image,
        .restaurant-image-placeholder {
          width: 150px;
          height: 150px;
          object-fit: cover;
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 24px;
        }

        .restaurant-info {
          flex: 1;
          padding: 20px;
        }

        .restaurant-info h3 {
          margin: 0 0 10px;
          font-size: 18px;
        }

        .restaurant-address {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .cuisine-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cuisine-tag {
          background-color: #f0f0f0;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          color: #666;
        }

        .user-card {
          display: flex;
          align-items: center;
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s;
        }

        .user-card:hover {
          transform: translateY(-2px);
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 15px;
        }

        .user-info h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .user-bio {
          margin: 0;
          color: #666;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .no-results {
          text-align: center;
          padding: 50px 0;
          color: #666;
        }

        @media (max-width: 768px) {
          .restaurant-card {
            flex-direction: column;
          }

          .restaurant-image,
          .restaurant-image-placeholder {
            width: 100%;
            height: 200px;
          }

          .search-tabs {
            justify-content: stretch;
          }

          .tab {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Search;