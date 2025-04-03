import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Content, ContentType, BaseContent } from 'utils/content-types';
import { uploadFile, uploadImage, UploadProgress } from 'utils/storage-service';
import { useContentStore } from 'utils/content-store';
import { useUserGuardContext } from 'app';
import { motion } from 'framer-motion';

interface ContentUploaderProps {
  contentType: ContentType;
  onComplete?: (content: Content) => void;
  onCancel?: () => void;
  className?: string;
}

export const ContentUploader: React.FC<ContentUploaderProps> = ({
  contentType,
  onComplete,
  onCancel,
  className = "",
}) => {
  const { user } = useUserGuardContext();
  const { addContent } = useContentStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [noteContent, setNoteContent] = useState('');
  const [url, setUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file drop for upload types
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    accept: getAcceptedFileTypes(contentType),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Common fields for all content types
      const baseContent: Omit<BaseContent, 'id'> = {
        userId: user.uid,
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        type: contentType,
        isFavorite: false,
        isPublic: false,
      };

      // Create content based on content type
      let createdContent: Content;

      switch (contentType) {
        case ContentType.PHOTO:
        case ContentType.ART:
          if (!file) {
            setError('Please select a file to upload');
            setIsSubmitting(false);
            return;
          }

          const { storageRef, thumbnailRef } = await uploadImage(
            user.uid, 
            contentType,
            file,
            setUploadProgress
          );

          createdContent = await addContent({
            ...baseContent,
            type: contentType,
            storageRef: fileStorageRef,
            thumbnailRef,
            medium: contentType === ContentType.ART ? 'digital' : undefined,
            dimensions: {
              width: 0, // We would calculate this from the actual image
              height: 0
            }
          });
          break;

        case ContentType.DOCUMENT:
          if (!file) {
            setError('Please select a file to upload');
            setIsSubmitting(false);
            return;
          }

          const fileStorageRef = await uploadFile(
            user.uid,
            contentType,
            file,
            setUploadProgress
          );

          createdContent = await addContent({
            ...baseContent,
            type: ContentType.DOCUMENT,
            storageRef,
            fileType: file.type,
            fileSize: file.size,
          });
          break;

        case ContentType.CODE:
          if (!code.trim()) {
            setError('Please enter some code');
            setIsSubmitting(false);
            return;
          }

          createdContent = await addContent({
            ...baseContent,
            type: ContentType.CODE,
            language,
            code,
            runnable: false, // Default to not runnable
          });
          break;

        case ContentType.NOTE:
          if (!noteContent.trim()) {
            setError('Please enter note content');
            setIsSubmitting(false);
            return;
          }

          createdContent = await addContent({
            ...baseContent,
            type: ContentType.NOTE,
            content: noteContent,
            color: getRandomColor(),
          });
          break;

        case ContentType.LINK:
          if (!url.trim()) {
            setError('Please enter a URL');
            setIsSubmitting(false);
            return;
          }

          // Validate URL format
          if (!isValidUrl(url)) {
            setError('Please enter a valid URL (include http:// or https://)');
            setIsSubmitting(false);
            return;
          }

          createdContent = await addContent({
            ...baseContent,
            type: ContentType.LINK,
            url,
            // In a real app, we would fetch favicon and metadata from the URL
          });
          break;

        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }

      onComplete?.(createdContent);
    } catch (err) {
      console.error('Error creating content:', err);
      setError('Failed to create content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className={`rounded-2xl backdrop-blur-lg bg-black/40 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">
        New {getContentTypeName(contentType)}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-500 text-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title field for all content types */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        {/* File upload for PHOTO, DOCUMENT, ART */}
        {(contentType === ContentType.PHOTO || 
          contentType === ContentType.DOCUMENT || 
          contentType === ContentType.ART) && (
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {contentType === ContentType.PHOTO ? 'Image' : 
               contentType === ContentType.DOCUMENT ? 'Document' : 'Artwork'}
            </label>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-purple-500 bg-purple-900/20' : 'border-white/20 hover:border-white/40'}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-white">
                  <p>Selected file: {file.name}</p>
                  <p className="text-sm text-white/60 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <p className="text-white/60">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Code editor for CODE type */}
        {contentType === ContentType.CODE && (
          <>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-white mb-1">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
                <option value="c#">C#</option>
                <option value="go">Go</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="rust">Rust</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell</option>
              </select>
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-white mb-1">
                Code
              </label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </>
        )}
        
        {/* Note editor for NOTE type */}
        {contentType === ContentType.NOTE && (
          <div>
            <label htmlFor="noteContent" className="block text-sm font-medium text-white mb-1">
              Note Content
            </label>
            <textarea
              id="noteContent"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}
        
        {/* URL input for LINK type */}
        {contentType === ContentType.LINK && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-white mb-1">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}
        
        {/* Description field for all types */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        {/* Tags field for all types */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-white mb-1">
            Tags (optional, comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="code, reference, tutorial"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        {/* Progress bar for uploads */}
        {uploadProgress && (
          <div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress.progress}%` }} 
              />
            </div>
            <p className="text-xs text-white/60 mt-1 text-right">
              {uploadProgress.progress}%
            </p>
          </div>
        )}
        
        {/* Submit and Cancel buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Helper functions

function getContentTypeName(contentType: ContentType): string {
  switch (contentType) {
    case ContentType.PHOTO: return 'Photo';
    case ContentType.DOCUMENT: return 'Document';
    case ContentType.CODE: return 'Code';
    case ContentType.NOTE: return 'Note';
    case ContentType.ART: return 'Artwork';
    case ContentType.LINK: return 'Link';
    default: return 'Content';
  }
}

function getAcceptedFileTypes(contentType: ContentType): Record<string, string[]> {
  switch (contentType) {
    case ContentType.PHOTO:
      return {
        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      };
    case ContentType.DOCUMENT:
      return {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'text/plain': ['.txt'],
        'application/rtf': ['.rtf']
      };
    case ContentType.ART:
      return {
        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
      };
    default:
      return {};
  }
}

function getRandomColor(): string {
  const colors = ['#8855ff', '#4466ff', '#ff5588', '#55ffaa', '#ffaa55', '#55aaff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export default ContentUploader;
