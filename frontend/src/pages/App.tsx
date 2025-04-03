import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ContentSphere } from "components/ContentSphere";
import { ContentType } from "utils/content-types";
import { useCurrentUser } from "app";

const App = () => {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Ensure app is properly initialized
    setInitialized(true);
    
    // If user is already logged in, we can optionally redirect to dashboard
    // Commented out for now to allow guests to see the landing page
    // if (user && !loading) {
    //   navigate('/dashboard');
    // }
  }, [user, loading, navigate]);

  const handleExplore = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Temporary content object for demonstration
  const demoContent = {
    id: 'demo',
    userId: 'demo',
    title: 'YAEGER',
    description: 'A dimensional digital portfolio',
    tags: ['creative', 'portfolio', 'digital'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    type: ContentType.ART,
    isPublic: true,
    isFavorite: false,
  };

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center relative">
      {/* Cosmic background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-purple-900/10 to-black">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center justify-center px-4 py-16">
        {/* Interactive sphere */}
        <div className="w-full h-[40vh] md:h-[50vh] mb-8">
          {initialized && (
            <ContentSphere content={demoContent} interactive={true} rotation={true} showEffects={true} />
          )}
        </div>
        
        {/* Title and description */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 mb-4">
            YAEGER
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
            A dimensional digital space for all things about you.
          </p>
        </motion.div>
        
        {/* Action buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            onClick={handleExplore}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {user ? 'Enter Your Space' : 'Begin Journey'}
          </motion.button>
          
          {!user && (
            <motion.button
              onClick={() => navigate('/login')}
              className="px-8 py-3 rounded-full bg-transparent border border-purple-500/50 text-white font-medium text-lg hover:bg-purple-500/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          )}
        </motion.div>
      </div>
      
      {/* Custom styles for cosmic background */}
      <style jsx>{`
        .stars {
          background: #000 url('https://static.databutton.com/public/00c837ad-1314-4fe4-800b-ad554619037e/2c5f1e01-a2b5-4f74-974a-4e1d23cde27e') repeat top center;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
          z-index: 0;
        }
        
        .twinkling {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
          background: transparent url('https://static.databutton.com/public/00c837ad-1314-4fe4-800b-ad554619037e/db2efe37-d29c-4de0-ad6d-15b7f10fec86') repeat top center;
          z-index: 1;
          animation: move-twink-back 200s linear infinite;
        }
        
        @keyframes move-twink-back {
          from {background-position:0 0;}
          to {background-position:-10000px 5000px;}
        }
      `}</style>
    </div>
  );
};

export default App;
