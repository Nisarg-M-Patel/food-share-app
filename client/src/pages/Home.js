// client/src/pages/Home.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import PostItem from '../components/PostItem';
import Navbar from '../components/Navbar';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState('global'); // 'global', 'following', 'nearby'
  const [userLocation, setUserLocation] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch posts based on feed type
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '/api/posts';
      let params = { page, limit: 10 };
      
      if (feedType === 'following' && isAuthenticated) {
        endpoint = '/api/posts/feed';
      } else if (feedType === 'nearby' && userLocation) {
        endpoint = '/api/posts/nearby';
        params = {
          ...params,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10, // 10km radius
        };
      }
      
      const res = await axios.get(endpoint, { params });
      
      if (page === 1) {
        setPosts(res.data.data);
      } else {
        setPosts([...posts, ...res.data.data]);
      }
      
      setHasMore(page < res.data.pagination.pages);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching posts');
      setLoading(false);
    }
  };

  // Fetch posts when component mounts or feed type changes
  useEffect(() => {
    if (feedType === 'nearby' && !userLocation) {
      return; // Wait for location before fetching nearby posts
    }
    
    setPage(1); // Reset to page 1 when feed type changes
    fetchPosts();
  }, [feedType, userLocation]);

  // Load more posts
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
      fetchPosts();
    }
  };

  // Handle feed type change
  const handleFeedTypeChange = (type) => {
    if (type === 'following' && !isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setFeedType(type);
  };

  return (
    <div className="home-container">
      <Navbar />
      
      <div className="feed-container">
        <div className="feed-header">
          <div className="feed-tabs">
            <button
              className={`feed-tab ${feedType === 'global' ? 'active' : ''}`}
              onClick={() => handleFeedTypeChange('global')}
            >
              Global
            </button>
            <button
              className={`feed-tab ${feedType === 'following' ? 'active' : ''}`}
              onClick={() => handleFeedTypeChange('following')}
            >
              Following
            </button>
            <button
              className={`feed-tab ${feedType === 'nearby' ? 'active' : ''}`}
              onClick={() => handleFeedTypeChange('nearby')}
              disabled={!userLocation}
            >
              Nearby
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="posts-container">
          {posts.length === 0 && !loading ? (
            <div className="no-posts">
              <p>No posts to show.</p>
              {feedType === 'following' && (
                <p>Follow more users to see their posts here!</p>
              )}
            </div>
          ) : (
            posts.map((post) => <PostItem key={post._id} post={post} />)
          )}
          
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
          
          {hasMore && !loading && (
            <button className="load-more-btn" onClick={loadMore}>
              Load More
            </button>
          )}
        </div>
      </div>
      
      {isAuthenticated && (
        <button
          className="create-post-btn"
          onClick={() => navigate('/create-post')}
        >
          <FaPlus />
        </button>
      )}

      <style jsx>{`
        .home-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .feed-container {
          max-width: 600px;
          width: 100%;
          margin: 70px auto 20px;
          padding: 0 15px;
        }

        .feed-header {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          padding: 15px;
        }

        .feed-tabs {
          display: flex;
          justify-content: space-between;
        }

        .feed-tab {
          flex: 1;
          background: none;
          border: none;
          padding: 10px;
          font-size: 16px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }

        .feed-tab.active {
          color: #ff6b6b;
          border-bottom: 2px solid #ff6b6b;
        }

        .feed-tab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .posts-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .no-posts {
          text-align: center;
          padding: 40px 20px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          color: #666;
        }

        .error-message {
          background-color: #ffe3e3;
          color: #e41e3f;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          padding: 20px 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 107, 107, 0.3);
          border-radius: 50%;
          border-top-color: #ff6b6b;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .load-more-btn {
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .load-more-btn:hover {
          background-color: #f5f5f5;
        }

        .create-post-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s, background-color 0.3s;
        }

        .create-post-btn:hover {
          transform: scale(1.1);
          background-color: #ff5252;
        }

        @media (max-width: 768px) {
          .feed-container {
            margin-top: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;