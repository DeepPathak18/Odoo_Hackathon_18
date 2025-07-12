"use client"

import { useState, useEffect } from "react"
import Modal from '../components/Modal'; // Assuming you have a Modal component
import ProfileUpdateModal from '../components/ProfileUpdateModal'; // New component
import UserDetailModal from '../components/UserDetailModal'; // New component

export default function CryptoDashboard() {
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    body: "",
    tagsInput: "", // New state for raw tag input
  })
  const [questions, setQuestions] = useState([])
  const [activeTab, setActiveTab] = useState("For you")
  const [commentTexts, setCommentTexts] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [trendingTags, setTrendingTags] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // New state for profile modal
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false); // New state for user detail modal
  const [selectedUserId, setSelectedUserId] = useState(null); // Stores the ID of the user to display in the modal

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    fetchQuestions();
    fetchTrendingTags();
  }, []);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openUserDetailModal = (userId) => {
    setSelectedUserId(userId);
    setIsUserDetailModalOpen(true);
  };
  const closeUserDetailModal = () => {
    setSelectedUserId(null);
    setIsUserDetailModalOpen(false);
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions")
      const data = await res.json()
      if (data.success) {
        setQuestions(data.data)
      } else {
        console.error("Failed to fetch questions:", data.error)
      }
    } catch (error) {
      console.error("An error occurred while fetching questions:", error)
    }
  }

  const fetchTrendingTags = async () => {
    try {
      const res = await fetch("/api/questions/trending-tags");
      const data = await res.json();
      if (data.success) {
        setTrendingTags(data.data);
      } else {
        console.error("Failed to fetch trending tags:", data.error);
      }
    } catch (error) {
      console.error("An error occurred while fetching trending tags:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCommentChange = (questionId, text) => {
    setCommentTexts((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("No authentication token found.")
      return
    }

    // Parse tags from tagsInput
    const tags = newQuestion.tagsInput
      .split(" ")
      .map((tag) => tag.startsWith("#") ? tag.substring(1) : tag)
      .filter((tag) => tag.trim() !== "");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newQuestion, tags }), // Send parsed tags
      })
      const data = await res.json()
      if (data.success) {
        setQuestions((prev) => [data.data, ...prev])
        setNewQuestion({ title: "", body: "", tagsInput: "" })
        fetchTrendingTags(); // Refresh trending tags after new post
      } else {
        console.error("Failed to create question:", data.error)
      }
    } catch (error) {
      console.error("An error occurred while creating question:", error)
    }
  }

  const handleCommentSubmit = async (questionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found.");
      return;
    }

    try {
      const res = await fetch(`/api/questions/${questionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: commentTexts[questionId] }),
      });
      const data = await res.json();
      if (data.success) {
        // Update the questions state to include the new comment
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q._id === questionId
              ? { ...q, comments: [...q.comments, data.data] }
              : q
          )
        );
        setCommentTexts((prev) => ({ ...prev, [questionId]: "" }));
      } else {
        console.error("Failed to add comment:", data.error);
      }
    } catch (error) {
      console.error("An error occurred while adding comment:", error);
    }
  };

  const handleVote = async (type, id, voteType) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found.");
      return;
    }

    try {
      const res = await fetch(`/api/${type}s/${id}/${voteType}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        // Update the questions state with the new vote count
        fetchQuestions(); // Re-fetch all questions to update vote counts
      } else {
        console.error(`Failed to ${voteType} ${type}:`, data.error);
      }
    } catch (error) {
      console.error(`An error occurred while ${voteType}ing ${type}:`, error);
    }
  };

  const handleUserSearch = async (e) => {
    setUserSearchTerm(e.target.value);
    if (e.target.value.length > 2) { // Only search if more than 2 characters
      try {
        const res = await fetch(`/api/users/search?name=${e.target.value}`);
        const data = await res.json();
        if (data.success) {
          setUserSearchResults(data.data);
        } else {
          console.error("User search failed:", data.error);
          setUserSearchResults([]);
        }
      } catch (error) {
        console.error("An error occurred during user search:", error);
        setUserSearchResults([]);
      }
    } else {
      setUserSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex justify-center">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-black border-r border-gray-800 min-h-screen p-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold">⧗</span>
            </div>
            <span className="text-white font-bold text-xl">StackIt</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {[{
              icon: "🏠",
              label: "Home",
              active: true
            },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full">
          {/* Header */}
          <div className="bg-black border-b border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{currentUser ? currentUser.name : "Rene Wells"}</span>
                    <span className="bg-green-500 text-black px-2 py-0.5 rounded text-xs font-bold">PRO</span>
                  </div>
                  <span className="text-gray-400 text-sm">{currentUser ? `@${currentUser.email.split('@')[0]}` : "@leftist_crypto_ow"}</span>
                </div>
              </div>

            </div>

            {/* Post Composer */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="title"
                    value={newQuestion.title}
                    onChange={handleInputChange}
                    placeholder="Question Title..."
                    className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-700 rounded-md p-2 mb-2 focus:outline-none focus:border-green-500"
                  />
                  <textarea
                    name="body"
                    value={newQuestion.body}
                    onChange={handleInputChange}
                    placeholder="Question Details..."
                    className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-700 rounded-md p-2 mb-2 focus:outline-none focus:border-green-500"
                    rows="2"
                  />
                  <input
                    type="text"
                    name="tagsInput"
                    value={newQuestion.tagsInput}
                    onChange={handleInputChange}
                    placeholder="Add tags (e.g., #react #javascript)"
                    className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-700 rounded-md p-2 mb-2 focus:outline-none focus:border-green-500"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={handlePostSubmit}
                      className="bg-green-500 text-black px-4 py-1 rounded-full font-medium hover:bg-green-400 transition duration-200"
                    >
                      Post →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Tabs */}
          <div className="bg-black border-b border-gray-800 px-4">
            <div className="flex space-x-6">
              {["For you", "Following"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-green-500 text-white"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Feed Posts */}
          <div className="bg-black">
            {questions.map((question) => (
              <div key={question._id} className="border-b border-gray-800 p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{question.author.name}</span>
                        <span className="text-gray-400 text-sm">{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-white mb-4">
                      <h3 className="text-lg font-semibold mb-1">{question.title}</h3>
                      <p className="text-gray-300">{question.body}</p>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap mt-2">
                          {question.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full mr-2 mb-2">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center space-x-4 text-gray-400">
                      <button 
                        onClick={() => handleVote("question", question._id, "upvote")} 
                        className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 hover:bg-gray-700 transition duration-200"
                      >
                        <span>👍</span>
                        <span>{question.votes.upvotes.length}</span>
                      </button>
                      <button 
                        onClick={() => handleVote("question", question._id, "downvote")} 
                        className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 hover:bg-gray-700 transition duration-200"
                      >
                        <span>👎</span>
                        <span>{question.votes.downvotes.length}</span>
                      </button>
                      <button 
                        className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 hover:bg-gray-700 transition duration-200"
                      >
                        <span>💬</span>
                        <span>{question.comments.length}</span>
                      </button>
                      <button 
                        className="flex items-center space-x-1 bg-gray-800 rounded-full px-3 py-1 hover:bg-gray-700 transition duration-200"
                      >
                        <span>🔖</span>
                        <span>Save</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-4">
                      {question.comments.map((comment) => (
                        <div key={comment._id} className="bg-gray-800 rounded-lg p-3 mb-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-white font-semibold">{comment.author.name}</span>
                            <span className="text-gray-400 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.body}</p>
                        </div>
                      ))}

                      {/* Add Comment Form */}
                      <div className="flex items-center space-x-2 mt-3">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentTexts[question._id] || ""}
                          onChange={(e) => handleCommentChange(question._id, e.target.value)}
                          className="flex-grow bg-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handleCommentSubmit(question._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-200"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-80 bg-black border-l border-gray-800 p-4">
          {/* Search and Settings */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 mr-3">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={handleUserSearch}
                className="w-full bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
              />
              {userSearchResults.length > 0 && (
                <div className="absolute z-10 bg-gray-700 w-full rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {userSearchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => openUserDetailModal(user._id)}
                      className="p-2 text-white hover:bg-gray-600 cursor-pointer"
                    >
                      {user.name} ({user.email})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={openProfileModal} className="text-gray-400 hover:text-white">
              <span className="text-xl">👤</span>
            </button>
          </div>

          {/* Trending Topics */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center">
              <span className="mr-2">🔥</span>
              Trending Topics
            </h3>
            <div className="space-y-2">
              {trendingTags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white cursor-pointer"
                >
                  <span className="text-gray-500 w-4">{index + 1}</span>
                  <span className="text-blue-400">#{tag._id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={closeProfileModal}>
        <ProfileUpdateModal currentUser={currentUser} onClose={closeProfileModal} setCurrentUser={setCurrentUser} />
      </Modal>

      {/* User Detail Modal */}
      {isUserDetailModalOpen && (
        <UserDetailModal userId={selectedUserId} onClose={closeUserDetailModal} />
      )}
    </div>
  )
}