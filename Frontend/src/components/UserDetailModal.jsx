import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const UserDetailModal = ({ userId, onClose }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (data.success) {
          setUserProfile(data.data.user);
          setUserQuestions(data.data.questions);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return <div className="text-white">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!userProfile) {
    return <div className="text-white">User not found.</div>;
  }

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-white text-black p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">{userProfile.name}'s Profile</h1>
        <p className="text-gray-600 mb-6">Email: {userProfile.email}</p>

        <h2 className="text-2xl font-bold mb-4">Questions Posted by {userProfile.name}</h2>
        {
          userQuestions.length > 0 ? (
            userQuestions.map((question) => (
              <div key={question._id} className="bg-gray-200 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
                <p className="text-gray-700 mb-2">{question.body}</p>
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap mt-2">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-400 text-gray-800 text-xs px-2 py-1 rounded-full mr-2 mb-2">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-sm mt-2">Posted on: {new Date(question.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No questions posted by this user yet.</p>
          )
        }
      </div>
    </Modal>
  );
};

export default UserDetailModal;