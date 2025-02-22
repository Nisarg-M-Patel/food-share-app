import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostItem from '../components/PostItem';
import { FaMapMarkerAlt } from 'react-icons/fa';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const [restaurant, setRestaurant] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const res = await axios.get(`/api/restaurants/${id}`);
        setRestaurant(res.data.data.restaurant);
        setRecentPosts(res.data.data.recentPosts);
        setLoading(false);
      } catch (err) {
        setError('Error loading restaurant details');
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div>
        <Navbar />
        <div className="error">{error || 'Restaurant not found'}</div>
      </div>
    );
  }

  return (
    <div className="restaurant-detail-container">
      <Navbar />
      
      <div className="restaurant-content">
        <div className="restaurant-header">
          {restaurant.images.length > 0 && (
            <img
              src={restaurant.images[0]}
              alt={restaurant.name}
              className="restaurant-image"
            />
          )}
          
          <div className="restaurant-info">
            <h1>{restaurant.name}</h1>
            
            {restaurant.address && (
              <p className="address">
                <FaMapMarkerAlt />
                {restaurant.address.street}, {restaurant.address.city},{' '}
                {restaurant.address.state} {restaurant.address.zipCode}
              </p>
            )}
            
            {restaurant.cuisine && restaurant.cuisine.length > 0 && (
              <div className="cuisine-tags">
                {restaurant.cuisine.map((item, index) => (
                  <span key={index} className="tag">{item}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="menu-section">
          <h2>Menu</h2>
          {restaurant.menu && restaurant.menu.length > 0 ? (
            <div className="menu-items">
              {restaurant.menu.map((item) => (
                <div key={item._id} className="menu-item">
                  <div className="menu-item-info">
                    <h3>{item.name}</h3>
                    {item.description && <p>{item.description}</p>}
                    {item.price && <span className="price">${item.price.toFixed(2)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No menu items available</p>
          )}
        </div>

        <div className="posts-section">
          <h2>Recent Posts</h2>
          {recentPosts.length > 0 ? (
            <div className="posts-grid">
              {recentPosts.map((post) => (
                <PostItem key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p>No posts yet</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .restaurant-detail-container {
          padding-top: 60px;
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .restaurant-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .restaurant-header {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .restaurant-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }

        .restaurant-info {
          padding: 20px;
        }

        .restaurant-info h1 {
          margin: 0 0 15px 0;
          font-size: 24px;
        }

        .address {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          margin-bottom: 15px;
        }

        .cuisine-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 14px;
          color: #666;
        }

        .menu-section, .posts-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
        }

        .menu-items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .menu-item {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
        }

        .menu-item h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .menu-item p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 14px;
        }

        .price {
          color: #ff6b6b;
          font-weight: 600;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .loading, .error {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        @media (max-width: 768px) {
          .restaurant-image {
            height: 200px;
          }
          
          .menu-items {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetail;