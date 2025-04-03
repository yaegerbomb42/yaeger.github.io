import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FluidBackground from 'components/FluidBackground';
import { DimensionalButton } from 'components/DimensionalButton';
import ContentBrowser from 'components/ContentBrowser';
import { useUserGuardContext } from 'app';
import { logoutUser } from 'utils/firebase';
import { getUserProfile } from 'utils/user-profile';
import { logUserActivity } from 'utils/user-profile';
import { ContentType } from 'utils/content-types';
import { useContentStore } from 'utils/content-store';

export default function Dashboard() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'categories' | 'browser'>('categories');
  const [activeContentType, setActiveContentType] = useState<ContentType | null>(null);
  const { allContent } = useContentStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user profile from Firestore
    const fetchProfile = async () => {
      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        // Log activity
        await logUserActivity(user.uid, 'dashboard_visit');
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  // Content categories for the user
  const contentCategories = [
    {
      name: 'Photography',
      icon: '📷',
      description: 'Your visual explorations and moments captured',
      color: 'from-purple-600 to-blue-600',
      type: ContentType.PHOTO
    },
    {
      name: 'Code',
      icon: '💻',
      description: 'Snippets, scripts, and programming experiments',
      color: 'from-pink-600 to-purple-600',
      type: ContentType.CODE
    },
    {
      name: 'Art',
      icon: '🎨',
      description: 'Digital creations and artistic expressions',
      color: 'from-orange-500 to-pink-600',
      type: ContentType.ART
    },
    {
      name: 'Notes',
      icon: '📝',
      description: 'Thoughts, ideas, and knowledge fragments',
      color: 'from-green-500 to-teal-600',
      type: ContentType.NOTE
    },
    {
      name: 'Links',
      icon: '🔗',
      description: 'Curated collection of inspiring websites',
      color: 'from-blue-500 to-cyan-600',
      type: ContentType.LINK
    },
    {
      name: 'Documents',
      icon: '📄',
      description: 'Articles, papers, and longer written works',
      color: 'from-indigo-600 to-blue-700',
      type: ContentType.DOCUMENT
    },
  ];
  
  // Go to content browser with specific content type
  const navigateToBrowser = (contentType: ContentType | null) => {
    setActiveContentType(contentType);
    setActiveView('browser');
  };

  return (
    <div className="relative min-h-screen">
      <FluidBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Top bar */}
          <motion.header 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <motion.h1 
                className="text-3xl font-bold text-white mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {profile?.displayName || user.displayName || 'Cosmic Explorer'}
              </motion.h1>
              <motion.p 
                className="text-white/70"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {user.email}
              </motion.p>
            </div>
            
            <motion.div
              className="mt-4 sm:mt-0 space-x-3 flex items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <DimensionalButton 
                variant="secondary"
                onClick={() => navigate('/profile')}
              >
                Profile
              </DimensionalButton>
              <DimensionalButton 
                variant="secondary" 
                onClick={handleLogout}
              >
                Logout
              </DimensionalButton>
            </motion.div>
          </motion.header>
          
          {/* Welcome message */}
          <motion.div 
            className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-xl p-8 mb-8 border border-purple-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Your Dimensional Space</h2>
            <p className="text-white/80 max-w-3xl">
              Welcome to your personal dimensional portfolio. This is where your digital creations exist 
              in a fluid space that transcends conventional web experiences. Explore your content spheres 
              and begin curating your dimensional collection.
            </p>
          </motion.div>
          
          {/* Main content area with animation between views */}
          <AnimatePresence mode="wait">
            {activeView === 'categories' ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5 }}
              >
                {/* Content categories grid */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {contentCategories.map((category, index) => {
                    // Count items of this type
                    const itemCount = allContent.filter(item => item.type === category.type).length;
                    
                    return (
                      <motion.div 
                        key={category.name}
                        className={`bg-gradient-to-br ${category.color} p-px rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{
                          boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)',
                        }}
                      >
                        <div className="bg-black/60 backdrop-blur-md p-6 h-full rounded-xl">
                          <div className="flex justify-between items-start mb-4">
                            <div className="text-3xl">{category.icon}</div>
                            <div className="bg-white/10 rounded-full px-3 py-1 text-xs font-medium text-white/70">
                              {itemCount} items
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                          <p className="text-white/70 text-sm mb-4">{category.description}</p>
                          
                          <div className="mt-auto pt-4">
                            <DimensionalButton 
                              variant="secondary" 
                              className="w-full"
                              onClick={() => navigateToBrowser(category.type)}
                            >
                              Explore
                            </DimensionalButton>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
                
                {/* View all content button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="flex justify-center mb-8"
                >
                  <DimensionalButton 
                    variant="primary" 
                    onClick={() => navigateToBrowser(null)}
                  >
                    View All Content
                  </DimensionalButton>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="browser"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                className="mt-6"
              >
                {/* Back button */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <DimensionalButton 
                    variant="secondary" 
                    onClick={() => setActiveView('categories')}
                  >
                    ← Back to Categories
                  </DimensionalButton>
                </motion.div>
                
                {/* Content browser */}
                <ContentBrowser initialContentType={activeContentType} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick stats bar - only show on categories view */}
          {activeView === 'categories' && (
            <motion.div 
              className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{allContent.length}</div>
                  <div className="text-sm text-white/60">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {new Set(allContent.flatMap(item => item.tags || [])).size}
                  </div>
                  <div className="text-sm text-white/60">Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}</div>
                  <div className="text-sm text-white/60">Last Login</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</div>
                  <div className="text-sm text-white/60">Joined</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
