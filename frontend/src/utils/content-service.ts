// Content service for Firebase Firestore operations

import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  Content,
  BaseContent,
  ContentType,
  ContentCollection,
  PhotoContent,
  DocumentContent,
  CodeContent,
  NoteContent,
  ArtContent,
  LinkContent
} from './content-types';

// Collection names in Firestore
const CONTENT_COLLECTION = 'content';
const COLLECTIONS_COLLECTION = 'collections';

// Convert Firestore data to a Content object
const convertToContent = (docData: DocumentData): Content => {
  const baseContent: BaseContent = {
    id: docData.id,
    userId: docData.userId,
    title: docData.title,
    description: docData.description || '',
    tags: docData.tags || [],
    createdAt: docData.createdAt?.toMillis() || Date.now(),
    updatedAt: docData.updatedAt?.toMillis() || Date.now(),
    type: docData.type,
    isFavorite: docData.isFavorite || false,
    isPublic: docData.isPublic || false,
    collections: docData.collections || []
  };

  // Return the appropriate content type based on the type field
  switch (docData.type) {
    case ContentType.PHOTO:
      return {
        ...baseContent,
        type: ContentType.PHOTO,
        storageRef: docData.storageRef,
        thumbnailRef: docData.thumbnailRef,
        dimensions: docData.dimensions,
        location: docData.location,
        camera: docData.camera
      } as PhotoContent;

    case ContentType.DOCUMENT:
      return {
        ...baseContent,
        type: ContentType.DOCUMENT,
        storageRef: docData.storageRef,
        fileType: docData.fileType,
        fileSize: docData.fileSize,
        previewRef: docData.previewRef
      } as DocumentContent;

    case ContentType.CODE:
      return {
        ...baseContent,
        type: ContentType.CODE,
        language: docData.language,
        code: docData.code,
        runnable: docData.runnable
      } as CodeContent;

    case ContentType.NOTE:
      return {
        ...baseContent,
        type: ContentType.NOTE,
        content: docData.content,
        color: docData.color
      } as NoteContent;

    case ContentType.ART:
      return {
        ...baseContent,
        type: ContentType.ART,
        storageRef: docData.storageRef,
        medium: docData.medium,
        dimensions: docData.dimensions
      } as ArtContent;

    case ContentType.LINK:
      return {
        ...baseContent,
        type: ContentType.LINK,
        url: docData.url,
        favicon: docData.favicon,
        ogImage: docData.ogImage,
        siteName: docData.siteName
      } as LinkContent;

    default:
      throw new Error(`Unknown content type: ${docData.type}`);
  }
};

// Convert a Content object to Firestore data
const convertFromContent = (content: Content): DocumentData => {
  const baseData = {
    userId: content.userId,
    title: content.title,
    description: content.description || '',
    tags: content.tags || [],
    type: content.type,
    isFavorite: content.isFavorite || false,
    isPublic: content.isPublic || false,
    collections: content.collections || [],
    updatedAt: serverTimestamp()
  };

  // If this is a new content (no id), add createdAt
  if (!content.id) {
    Object.assign(baseData, { createdAt: serverTimestamp() });
  }

  // Add type-specific fields
  switch (content.type) {
    case ContentType.PHOTO:
      const photoContent = content as PhotoContent;
      return {
        ...baseData,
        storageRef: photoContent.storageRef,
        thumbnailRef: photoContent.thumbnailRef,
        dimensions: photoContent.dimensions,
        location: photoContent.location,
        camera: photoContent.camera
      };

    case ContentType.DOCUMENT:
      const documentContent = content as DocumentContent;
      return {
        ...baseData,
        storageRef: documentContent.storageRef,
        fileType: documentContent.fileType,
        fileSize: documentContent.fileSize,
        previewRef: documentContent.previewRef
      };

    case ContentType.CODE:
      const codeContent = content as CodeContent;
      return {
        ...baseData,
        language: codeContent.language,
        code: codeContent.code,
        runnable: codeContent.runnable
      };

    case ContentType.NOTE:
      const noteContent = content as NoteContent;
      return {
        ...baseData,
        content: noteContent.content,
        color: noteContent.color
      };

    case ContentType.ART:
      const artContent = content as ArtContent;
      return {
        ...baseData,
        storageRef: artContent.storageRef,
        medium: artContent.medium,
        dimensions: artContent.dimensions
      };

    case ContentType.LINK:
      const linkContent = content as LinkContent;
      return {
        ...baseData,
        url: linkContent.url,
        favicon: linkContent.favicon,
        ogImage: linkContent.ogImage,
        siteName: linkContent.siteName
      };

    default:
      throw new Error(`Unknown content type: ${content.type}`);
  }
};

// Convert Firestore collection data to a ContentCollection object
const convertToCollection = (docData: DocumentData): ContentCollection => {
  return {
    id: docData.id,
    userId: docData.userId,
    name: docData.name,
    description: docData.description || '',
    coverImage: docData.coverImage,
    createdAt: docData.createdAt?.toMillis() || Date.now(),
    updatedAt: docData.updatedAt?.toMillis() || Date.now(),
    contentCount: docData.contentCount || 0,
    isPublic: docData.isPublic || false,
    color: docData.color
  };
};

// CRUD operations for content

// Create a new content item
export const createContent = async <T extends Content>(content: Omit<T, 'id'>): Promise<T> => {
  try {
    const contentData = convertFromContent(content as Content);
    const contentRef = await addDoc(collection(db, CONTENT_COLLECTION), contentData);
    
    // Get the created document with its ID
    const createdDoc = await getDoc(contentRef);
    const createdData = createdDoc.data();
    if (!createdData) throw new Error('Failed to create content');
    
    return {
      ...convertToContent(createdData),
      id: contentRef.id
    } as T;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

// Get a content item by ID
export const getContent = async <T extends Content>(contentId: string): Promise<T | null> => {
  try {
    const contentRef = doc(db, CONTENT_COLLECTION, contentId);
    const contentSnap = await getDoc(contentRef);
    
    if (contentSnap.exists()) {
      const contentData = contentSnap.data();
      return {
        ...convertToContent(contentData),
        id: contentSnap.id
      } as T;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting content:', error);
    throw error;
  }
};

// Update a content item
export const updateContent = async <T extends Content>(contentId: string, content: Partial<T>): Promise<void> => {
  try {
    const contentRef = doc(db, CONTENT_COLLECTION, contentId);
    const contentSnap = await getDoc(contentRef);
    
    if (!contentSnap.exists()) {
      throw new Error(`Content with ID ${contentId} not found`);
    }
    
    const currentData = contentSnap.data();
    const updatedData = {
      ...currentData,
      ...convertFromContent({ ...currentData, ...content } as Content),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(contentRef, updatedData);
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Delete a content item
export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    const contentRef = doc(db, CONTENT_COLLECTION, contentId);
    await deleteDoc(contentRef);
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Get all content for a user
export const getUserContent = async (userId: string): Promise<Content[]> => {
  try {
    const contentQuery = query(
      collection(db, CONTENT_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const contentSnap = await getDocs(contentQuery);
    return contentSnap.docs.map(docSnap => {
      return {
        ...convertToContent(docSnap.data()),
        id: docSnap.id
      };
    });
  } catch (error) {
    console.error('Error getting user content:', error);
    throw error;
  }
};

// Get content by type
export const getContentByType = async (userId: string, type: ContentType): Promise<Content[]> => {
  try {
    const contentQuery = query(
      collection(db, CONTENT_COLLECTION),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    
    const contentSnap = await getDocs(contentQuery);
    return contentSnap.docs.map(docSnap => {
      return {
        ...convertToContent(docSnap.data()),
        id: docSnap.id
      };
    });
  } catch (error) {
    console.error(`Error getting ${type} content:`, error);
    throw error;
  }
};

// Subscribe to user content updates (real-time)
export const subscribeToUserContent = (
  userId: string,
  callback: (content: Content[]) => void
) => {
  const contentQuery = query(
    collection(db, CONTENT_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(contentQuery, (snapshot) => {
    const content = snapshot.docs.map(docSnap => {
      return {
        ...convertToContent(docSnap.data()),
        id: docSnap.id
      };
    });
    callback(content);
  });
};

// CRUD operations for collections

// Create a new collection
export const createCollection = async (collection: Omit<ContentCollection, 'id'>): Promise<ContentCollection> => {
  try {
    const collectionData = {
      userId: collection.userId,
      name: collection.name,
      description: collection.description || '',
      coverImage: collection.coverImage,
      contentCount: collection.contentCount || 0,
      isPublic: collection.isPublic || false,
      color: collection.color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const collectionRef = await addDoc(collection(db, COLLECTIONS_COLLECTION), collectionData);
    
    // Get the created document with its ID
    const createdDoc = await getDoc(collectionRef);
    const createdData = createdDoc.data();
    if (!createdData) throw new Error('Failed to create collection');
    
    return {
      ...convertToCollection(createdData),
      id: collectionRef.id
    };
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

// Get a collection by ID
export const getCollection = async (collectionId: string): Promise<ContentCollection | null> => {
  try {
    const collectionRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
    const collectionSnap = await getDoc(collectionRef);
    
    if (collectionSnap.exists()) {
      const collectionData = collectionSnap.data();
      return {
        ...convertToCollection(collectionData),
        id: collectionSnap.id
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
};

// Update a collection
export const updateCollection = async (collectionId: string, updates: Partial<ContentCollection>): Promise<void> => {
  try {
    const collectionRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(collectionRef, updatedData);
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

// Delete a collection
export const deleteCollection = async (collectionId: string): Promise<void> => {
  try {
    const collectionRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
    await deleteDoc(collectionRef);
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

// Get all collections for a user
export const getUserCollections = async (userId: string): Promise<ContentCollection[]> => {
  try {
    const collectionsQuery = query(
      collection(db, COLLECTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const collectionsSnap = await getDocs(collectionsQuery);
    return collectionsSnap.docs.map(docSnap => {
      return {
        ...convertToCollection(docSnap.data()),
        id: docSnap.id
      };
    });
  } catch (error) {
    console.error('Error getting user collections:', error);
    throw error;
  }
};

// Subscribe to user collections updates (real-time)
export const subscribeToUserCollections = (
  userId: string,
  callback: (collections: ContentCollection[]) => void
) => {
  const collectionsQuery = query(
    collection(db, COLLECTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(collectionsQuery, (snapshot) => {
    const collections = snapshot.docs.map(docSnap => {
      return {
        ...convertToCollection(docSnap.data()),
        id: docSnap.id
      };
    });
    callback(collections);
  });
};
