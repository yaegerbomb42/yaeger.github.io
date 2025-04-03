import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContentSphereContainer } from "components/ContentSphere";
import ContentUploader from "components/ContentUploader";
import { useContentStore } from "utils/content-store";
import { Content, ContentType, contentTypeVisuals } from "utils/content-types";
import { useUserGuardContext } from "app";

export interface ContentBrowserProps {
  className?: string;
  initialContentType?: ContentType | null;
}

const ContentBrowser: React.FC<ContentBrowserProps> = ({
  className = "",
  initialContentType = null,
}) => {
  const { user } = useUserGuardContext();
  const {
    allContent,
    contentByType,
    isLoading,
    error,
    initialize,
    cleanup,
    selectedContent,
    selectContent,
  } = useContentStore();

  // Local state
  const [activeType, setActiveType] = useState<ContentType | null>(initialContentType);
  const [showUploader, setShowUploader] = useState(false);
  const [sphereHovered, setSphereHovered] = useState(false);
  const [uploaderContentType, setUploaderContentType] = useState<ContentType>(ContentType.PHOTO);

  // Initialize store when component mounts
  useEffect(() => {
    if (user) {
      initialize(user.uid);
    }

    return () => {
      cleanup();
    };
  }, [user, initialize, cleanup]);

  // Content to display based on active type
  const displayContent = activeType ? contentByType[activeType] : allContent;

  // Handle content selection
  const handleSelectContent = (content: Content) => {
    selectContent(content.id);
  };

  // Open uploader for specific content type
  const openUploader = (contentType: ContentType) => {
    setUploaderContentType(contentType);
    setShowUploader(true);
  };

  // Close uploader
  const closeUploader = () => {
    setShowUploader(false);
  };

  // Handle upload completion
  const handleUploadComplete = (content: Content) => {
    closeUploader();
    selectContent(content.id);
  };

  // Fluid animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
      },
    },
  };

  // Content type filter buttons
  const contentTypeButtons = [
    { type: null, label: "All" },
    { type: ContentType.PHOTO, label: "Photos" },
    { type: ContentType.DOCUMENT, label: "Documents" },
    { type: ContentType.CODE, label: "Code" },
    { type: ContentType.NOTE, label: "Notes" },
    { type: ContentType.ART, label: "Art" },
    { type: ContentType.LINK, label: "Links" },
  ];

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Background cosmic effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-purple-900/20 to-black opacity-80" />
        
        {/* Particle stars */}
        {Array.from({ length: 100 }).map((_, i) => {
          const size = Math.random() * 2 + 1;
          const duration = Math.random() * 10 + 10;
          const delay = Math.random() * 5;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                repeat: Infinity,
                duration,
                delay,
              }}
            />
          );
        })}
      </div>

      {/* Content browser */}
      <div className="relative z-10 w-full h-full">
        {/* Type filters */}
        <motion.div
          className="flex justify-center pt-8 pb-4 gap-3 flex-wrap"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contentTypeButtons.map(({ type, label }) => {
            const isActive = type === activeType;
            const color = type ? contentTypeVisuals[type].baseColor : "#ffffff";

            return (
              <motion.button
                key={label}
                onClick={() => setActiveType(type)}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 border ${isActive ? 'border-white' : 'border-white/20'}`}
                style={{
                  backgroundColor: isActive ? `${color}33` : "rgba(0,0,0,0.3)",
                  boxShadow: isActive ? `0 0 15px ${color}66` : "none",
                }}
              >
                <span className="text-white text-sm font-semibold">{label}</span>
              </motion.button>
            );
          })}

          {/* Add new content button */}
          <motion.button
            onClick={() => openUploader(activeType || ContentType.PHOTO)}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 bg-purple-600 border border-purple-400 shadow-lg shadow-purple-900/30"
          >
            <span className="text-white text-sm font-semibold">Add New</span>
          </motion.button>
        </motion.div>

        {/* Content display area */}
        <div className="w-full h-[70vh] relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <div className="w-12 h-12 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-300 rounded-full animate-spin" />
                </div>
              </div>
            </div>
          ) : displayContent.length > 0 ? (
            <ContentSphereContainer
              contents={displayContent}
              onSelectContent={handleSelectContent}
              selectedContentId={selectedContent?.id}
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div 
                className="p-8 rounded-2xl backdrop-blur-md bg-black/30 border border-white/10 max-w-md text-center"
                style={{
                  boxShadow: '0 0 30px rgba(138, 43, 226, 0.15)',
                }}
              >
                <h3 className="text-xl text-white mb-4">
                  {activeType
                    ? `No ${contentTypeVisuals[activeType].label} found`
                    : "No content found"}
                </h3>
                <p className="text-white/70 mb-6">
                  {activeType
                    ? `Start by adding your first ${contentTypeVisuals[activeType].label.toLowerCase()}`
                    : "Start by adding your first piece of content"}
                </p>
                <button
                  onClick={() => openUploader(activeType || ContentType.PHOTO)}
                  className="px-6 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/30"
                >
                  Create New {activeType ? contentTypeVisuals[activeType].label : "Content"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected content detail view (could be added in future) */}
        {selectedContent && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-xl bg-black/40 border-t border-white/10"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedContent.title}</h2>
                  {selectedContent.description && (
                    <p className="text-white/80 mt-1">{selectedContent.description}</p>
                  )}
                  {selectedContent.tags && selectedContent.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {selectedContent.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => selectContent(null)} 
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content preview could be added here based on content type */}
            </div>
          </motion.div>
        )}
      </div>

      {/* Content uploader modal */}
      <AnimatePresence>
        {showUploader && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUploader}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ContentUploader
                contentType={uploaderContentType}
                onComplete={handleUploadComplete}
                onCancel={closeUploader}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentBrowser;
