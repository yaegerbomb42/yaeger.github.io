// Firebase Storage service for binary files (images, documents, etc.)

import { db } from './firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ContentType } from './content-types';

// Initialize Firebase Storage
const storage = getStorage();

// Generate a unique file path for uploads
const generateStoragePath = (userId: string, contentType: ContentType, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `users/${userId}/${contentType}/${timestamp}_${sanitizedFileName}`;
};

// Generate a thumbnail path from an original path
const generateThumbnailPath = (originalPath: string): string => {
  const pathParts = originalPath.split('/');
  const fileName = pathParts.pop();
  return [...pathParts, `thumb_${fileName}`].join('/');
};

// Interface for upload progress tracking
export interface UploadProgress {
  progress: number;  // 0-100
  downloadURL?: string;
  error?: Error;
  state: 'running' | 'paused' | 'success' | 'error';
}

// Upload a file to Firebase Storage with progress tracking
export const uploadFile = (
  userId: string,
  contentType: ContentType,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create storage reference
      const storagePath = generateStoragePath(userId, contentType, file.name);
      const storageRef = ref(storage, storagePath);
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Listen for state changes, errors, and completion
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.({ progress, state: 'running' });
        },
        (error) => {
          // Handle errors
          console.error('Upload error:', error);
          onProgress?.({ progress: 0, error, state: 'error' });
          reject(error);
        },
        async () => {
          // On success
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.({ progress: 100, downloadURL, state: 'success' });
            resolve(storagePath);
          } catch (error) {
            console.error('Error getting download URL:', error);
            onProgress?.({ progress: 100, error: error as Error, state: 'error' });
            reject(error);
          }
        }
      );
    } catch (error) {
      console.error('Upload setup error:', error);
      reject(error);
    }
  });
};

// Get the download URL for a file
export const getFileURL = async (storagePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, storagePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// Delete a file from storage
export const deleteFile = async (storagePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Upload an image with thumbnail generation
export const uploadImage = async (
  userId: string,
  contentType: ContentType.PHOTO | ContentType.ART,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ storageRef: string; thumbnailRef: string }> => {
  try {
    // Upload original image
    const storageRef = await uploadFile(userId, contentType, file, onProgress);
    
    // For now, we'll just use the same image for thumbnail
    // In a production app, we would generate and upload a real thumbnail
    const thumbnailRef = storageRef;
    
    return { storageRef, thumbnailRef };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Create a file object from a data URL (for pasting images, screenshots, etc.)
export const dataURLtoFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    throw new Error('Invalid data URL');
  }
  
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

// Calculate the file size in a human-readable format
export const getHumanFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Get file extension from file name
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

// Determine if a file is an image based on its MIME type
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Determine if a file is a document (PDF, DOCX, etc.)
export const isDocumentFile = (file: File): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf'
  ];
  
  return documentTypes.includes(file.type);
};
