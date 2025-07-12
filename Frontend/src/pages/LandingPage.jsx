import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  };

  

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Grid background with glow */}
      <div className="absolute inset-0 bg-grid-dark pointer-events-none z-0 before:content-[''] before:absolute before:inset-0 before:bg-grid-dark before:blur-md before:opacity-50" />

      {/* Right side white gradient overlay */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent z-10 pointer-events-none" />

      {/* Main content */}
      <motion.div
        className="relative z-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Navigation */}
        <motion.nav
          className="flex items-center justify-between px-6 py-4 md:px-12"
          variants={containerVariants}
        >
          <motion.div className="flex items-center" variants={itemVariants}>
            <div className="mr-2 h-6 w-6 bg-white rounded"></div>
            <span className="font-bold text-lg tracking-wide">StackIt</span>
          </motion.div>

          {/* <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-400 hover:text-white transition">Research</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Features</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Product</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Community</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Blog</a>
          </div> */}

          <motion.div className="flex items-center space-x-4" variants={containerVariants}>
            <motion.button
              className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
              onClick={openLoginModal}
              variants={itemVariants}
            >
              Login
            </motion.button>
            <motion.button
              className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
              onClick={openSignupModal}
              variants={itemVariants}
            >
              Sign Up
            </motion.button>
          </motion.div>
        </motion.nav>

        <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
          <LoginForm />
        </Modal>

        <Modal isOpen={isSignupModalOpen} onClose={closeSignupModal}>
          <SignupForm onSignupSuccess={() => { closeSignupModal(); openLoginModal(); }} />
        </Modal>

        {/* Hero Section */}
        <motion.section
          className="flex flex-col items-center text-center mt-20 md:mt-32 px-4"
          variants={containerVariants}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            variants={itemVariants}
          >
            Powered by Questions,<span className="text-gray-400">Built by Community</span>
          </motion.h1>
          <motion.p
            className="text-gray-400 max-w-2xl mb-10 text-lg"
            variants={itemVariants}
          >
            Post your doubts, share your knowledge, and grow together in a community that cares.
          </motion.p>

          {/* Image with web-like border */}
          <motion.div
            className="mt-10 md:mt-16 w-full max-w-6xl mx-auto"
            variants={imageVariants}
          >
            <img
              src="/image.png"
              alt="Web interface screenshot"
              className="w-full h-auto rounded-lg shadow-lg border border-gray-700"
            />
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default LandingPage;
