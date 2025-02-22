import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostItem from '../components/PostItem';
import { FaUserEdit } from 'react-icons/fa';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${id}`);
        setUser(res.data.data.user);
        setPosts(res.data.data.posts);
        setIsFollowing(
          isAuthenticated &&
          res.data.data.user.followers.includes(currentUser?._id)
        );
        setLoading(false);
      } catch (err) {
        setError('Error loading profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, isAuthenticated, currentUser]);

  const handleFollow = async () => {
    try {
      const res = await axios.put(`/api/users/${id}/follow`);
      setIsFollowing(res.data.data.isFollowing);
      setUser(prevUser => ({
        ...prevUser,
        followers: res.data.data.isFollowing
          ? [...prevUser.followers, currentUser._id]
          : prevUser.followers.filter(id => id !== currentUser._id)
      }));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <Navbar />
        <div className="error">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Navbar />
      
      <div className="profile-content">
        <div className="profile-header">
          <img
            src={user.profilePicture || '/default-avatar.png'}
            alt={user.username}
            className="profile-picture"
          />
          
          <div className="profile-info">
            <h1>{user.username}</h1>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-count">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-count">{user.followers.length}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-count">{user.following.length}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
            
            {user.bio && <p className="bio">{user.bio}</p>}
            
            {isAuthenticated && currentUser._id !== id && (
              <button
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            
            {isAuthenticated && currentUser._id === id && (
              <Link to="/settings" className="edit-profile-btn">
                <FaUserEdit /> Edit Profile
              </Link>
            )}
          </div>
        </div>
        
        <div className="posts-grid">
          {posts.map(post => (
            <PostItem key={post._id} post={post} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .profile-content {
          max-width: 935px;
          margin: 80px auto 30px;
          padding: 0 20px;
        }

        .profile-header {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .profile-picture {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 50px;
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h1 {
          margin: 0 0 20px;
          font-size: 28px;
        }

        .profile-stats {
          display: flex;
          gap: 40px;
          margin-bottom: 20px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-count {
          font-size: 18px;
          font-weight: 600;
        }

        .stat-label {
          color: #666;
          font-size: 14px;
        }

        .bio {
          margin-bottom: 20px;
          line-height: 1.5;
          color: #333;
        }

        .follow-btn {
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 10px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .follow-btn.following {
          background-color: #e0e0e0;
          color: #333;
        }

        .edit-profile-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #f0f0f0;
          color: #333;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .profile-picture {
            margin: 0 0 20px;
          }

          .profile-stats {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;