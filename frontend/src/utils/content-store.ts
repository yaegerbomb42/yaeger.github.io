// Content store with Zustand for state management

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  Content,
  ContentType,
  ContentCollection,
  contentTypeVisuals
} from './content-types';
import {
  getUserContent,
  getContentByType,
  subscribeToUserContent,
  getUserCollections,
  subscribeToUserCollections,
  createContent,
  updateContent,
  deleteContent,
  createCollection,
  updateCollection,
  deleteCollection
} from './content-service';

interface ContentStore {
  // Content state
  allContent: Content[];
  contentByType: Record<ContentType, Content[]>;
  collections: ContentCollection[];
  selectedContent: Content | null;
  selectedCollection: ContentCollection | null;
  isLoading: boolean;
  error: Error | null;
  
  // Subscriptions
  contentUnsubscribe: (() => void) | null;
  collectionsUnsubscribe: (() => void) | null;
  
  // Actions - Content
  initialize: (userId: string) => Promise<void>;
  cleanup: () => void;
  loadContent: (userId: string) => Promise<void>;
  loadCollections: (userId: string) => Promise<void>;
  selectContent: (contentId: string | null) => void;
  selectCollection: (collectionId: string | null) => void;
  addContent: <T extends Content>(content: Omit<T, 'id'>) => Promise<T>;
  editContent: <T extends Content>(contentId: string, updates: Partial<T>) => Promise<void>;
  removeContent: (contentId: string) => Promise<void>;
  toggleFavorite: (contentId: string) => Promise<void>;
  toggleContentPublic: (contentId: string) => Promise<void>;
  
  // Actions - Collections
  addCollection: (collection: Omit<ContentCollection, 'id'>) => Promise<ContentCollection>;
  editCollection: (collectionId: string, updates: Partial<ContentCollection>) => Promise<void>;
  removeCollection: (collectionId: string) => Promise<void>;
  addToCollection: (contentId: string, collectionId: string) => Promise<void>;
  removeFromCollection: (contentId: string, collectionId: string) => Promise<void>;
}

export const useContentStore = create<ContentStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        allContent: [],
        contentByType: {
          [ContentType.PHOTO]: [],
          [ContentType.DOCUMENT]: [],
          [ContentType.CODE]: [],
          [ContentType.NOTE]: [],
          [ContentType.ART]: [],
          [ContentType.LINK]: []
        },
        collections: [],
        selectedContent: null,
        selectedCollection: null,
        isLoading: false,
        error: null,
        contentUnsubscribe: null,
        collectionsUnsubscribe: null,
        
        // Initialize store with subscriptions
        initialize: async (userId: string) => {
          try {
            set({ isLoading: true, error: null });
            
            // Set up content subscription
            const contentUnsubscribe = subscribeToUserContent(userId, (content) => {
              // Group content by type
              const contentByType = {
                [ContentType.PHOTO]: [],
                [ContentType.DOCUMENT]: [],
                [ContentType.CODE]: [],
                [ContentType.NOTE]: [],
                [ContentType.ART]: [],
                [ContentType.LINK]: []
              } as Record<ContentType, Content[]>;
              
              content.forEach(item => {
                if (contentByType[item.type]) {
                  contentByType[item.type].push(item);
                }
              });
              
              set({ allContent: content, contentByType, isLoading: false });
            });
            
            // Set up collections subscription
            const collectionsUnsubscribe = subscribeToUserCollections(userId, (collections) => {
              set({ collections, isLoading: false });
            });
            
            set({ contentUnsubscribe, collectionsUnsubscribe });
          } catch (error) {
            console.error('Error initializing content store:', error);
            set({ error: error as Error, isLoading: false });
          }
        },
        
        // Clean up subscriptions
        cleanup: () => {
          const { contentUnsubscribe, collectionsUnsubscribe } = get();
          if (contentUnsubscribe) contentUnsubscribe();
          if (collectionsUnsubscribe) collectionsUnsubscribe();
          set({ contentUnsubscribe: null, collectionsUnsubscribe: null });
        },
        
        // Load content without subscription
        loadContent: async (userId: string) => {
          try {
            set({ isLoading: true, error: null });
            const content = await getUserContent(userId);
            
            // Group content by type
            const contentByType = {
              [ContentType.PHOTO]: [],
              [ContentType.DOCUMENT]: [],
              [ContentType.CODE]: [],
              [ContentType.NOTE]: [],
              [ContentType.ART]: [],
              [ContentType.LINK]: []
            } as Record<ContentType, Content[]>;
            
            content.forEach(item => {
              if (contentByType[item.type]) {
                contentByType[item.type].push(item);
              }
            });
            
            set({ allContent: content, contentByType, isLoading: false });
          } catch (error) {
            console.error('Error loading content:', error);
            set({ error: error as Error, isLoading: false });
          }
        },
        
        // Load collections without subscription
        loadCollections: async (userId: string) => {
          try {
            set({ isLoading: true, error: null });
            const collections = await getUserCollections(userId);
            set({ collections, isLoading: false });
          } catch (error) {
            console.error('Error loading collections:', error);
            set({ error: error as Error, isLoading: false });
          }
        },
        
        // Select content for viewing/editing
        selectContent: (contentId: string | null) => {
          if (!contentId) {
            set({ selectedContent: null });
            return;
          }
          
          const { allContent } = get();
          const selectedContent = allContent.find(item => item.id === contentId) || null;
          set({ selectedContent });
        },
        
        // Select collection
        selectCollection: (collectionId: string | null) => {
          if (!collectionId) {
            set({ selectedCollection: null });
            return;
          }
          
          const { collections } = get();
          const selectedCollection = collections.find(item => item.id === collectionId) || null;
          set({ selectedCollection });
        },
        
        // Add new content
        addContent: async <T extends Content>(content: Omit<T, 'id'>) => {
          try {
            set({ isLoading: true, error: null });
            const newContent = await createContent<T>(content);
            
            // Optimistic update (will be overridden by subscription)
            const { allContent, contentByType } = get();
            const updatedAll = [...allContent, newContent];
            const updatedByType = {
              ...contentByType,
              [newContent.type]: [...contentByType[newContent.type], newContent]
            };
            
            set({ allContent: updatedAll, contentByType: updatedByType, isLoading: false });
            return newContent;
          } catch (error) {
            console.error('Error adding content:', error);
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },
        
        // Edit content
        editContent: async <T extends Content>(contentId: string, updates: Partial<T>) => {
          try {
            set({ isLoading: true, error: null });
            await updateContent<T>(contentId, updates);
            
            // Optimistic update (will be overridden by subscription)
            const { allContent, contentByType, selectedContent } = get();
            
            // Update in all content
            const updatedAll = allContent.map(item => 
              item.id === contentId ? { ...item, ...updates } : item
            );
            
            // Update in content by type
            const itemToUpdate = allContent.find(item => item.id === contentId);
            if (itemToUpdate) {
              const updatedByType = { ...contentByType };
              updatedByType[itemToUpdate.type] = updatedByType[itemToUpdate.type].map(item => 
                item.id === contentId ? { ...item, ...updates } : item
              );
              
              // Update selected content if it's the one being edited
              const updatedSelected = selectedContent?.id === contentId
                ? { ...selectedContent, ...updates }
                : selectedContent;
              
              set({ 
                allContent: updatedAll, 
                contentByType: updatedByType, 
                selectedContent: updatedSelected,
                isLoading: false 
              });
            }
          } catch (error) {
            console.error('Error editing content:', error);
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },
        
        // Remove content
        removeContent: async (contentId: string) => {
          try {
            set({ isLoading: true, error: null });
            await deleteContent(contentId);
            
            // Optimistic update (will be overridden by subscription)
            const { allContent, contentByType, selectedContent } = get();
            
            // Remove from all content
            const itemToRemove = allContent.find(item => item.id === contentId);
            const updatedAll = allContent.filter(item => item.id !== contentId);
            
            if (itemToRemove) {
              // Remove from content by type
              const updatedByType = { ...contentByType };
              updatedByType[itemToRemove.type] = updatedByType[itemToRemove.type]
                .filter(item => item.id !== contentId);
              
              // Clear selected content if it's the one being removed
              const updatedSelected = selectedContent?.id === contentId ? null : selectedContent;
              
              set({ 
                allContent: updatedAll, 
                contentByType: updatedByType, 
                selectedContent: updatedSelected,
                isLoading: false 
              });
            }
          } catch (error) {
            console.error('Error removing content:', error);
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },
        
        // Toggle favorite status
        toggleFavorite: async (contentId: string) => {
          const { allContent } = get();
          const content = allContent.find(item => item.id === contentId);
          
          if (content) {
            await get().editContent(contentId, { isFavorite: !content.isFavorite });
          }
        },
        
        // Toggle public status
        toggleContentPublic: async (contentId: string) => {
          const { allContent } = get();
          const content = allContent.find(item => item.id === contentId);
          
          if (content) {
            await get().editContent(contentId, { isPublic: !content.isPublic });
          }
        },
        
        // Add collection
        addCollection: async (collection: Omit<ContentCollection, 'id'>) => {
          try {
            set({ isLoading: true, error: null });
            const newCollection = await createCollection(collection);
            
            // Optimistic update (will be overridden by subscription)
            const { collections } = get();
            const updatedCollections = [...collections, newCollection];
            
            set({ collections: updatedCollections, isLoading: false });
            return newCollection;
          } catch (error) {
            console.error('Error adding collection:', error);
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },
        
        // Edit collection
        editCollection: async (collectionId: string, updates: Partial<ContentCollection>) => {
          try {
            set({ isLoading: true, error: null });
            await updateCollection(collectionId, updates);
            
            // Optimistic update (will be overridden by subscription)
            const { collections, selectedCollection } = get();
            const updatedCollections = collections.map(item => 
              item.id === collectionId ? { ...item, ...updates } : item
            );
            
            // Update selected collection if it's the one being edited
            const updatedSelected = selectedCollection?.id === collectionId
              ? { ...selectedCollection, ...updates }
              : selectedCollection;
            
            set({ 
              collections: updatedCollections, 
              selectedCollection: updatedSelected,
              isLoading: false 
            });
          } catch (error) {
            console.error('Error editing collection:', error);
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },
        
        // Remove collection
        removeCollection: async (collectionId: string) => {
          try {
            set({ isLoading: true, error: null });
            await deleteCollection(collectionId);
            
            // Optimistic update (will be overridden by subscription)
            const { collections, selectedCollection } = get();
            const updatedCollections = collections.filter(item => item.id !== collectionId);
            
            // Clear selected collection if it's the one being removed
            const updatedSelected = selectedCollection?.id === collectionId ? null : selectedCollection;
            
            set({ 
              collections: updatedCollections, 
              selectedCollection: updatedSelected,
              isLoading: false 
            });
          } catch (error) {
            console.error('Error removing collection:', error);
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },
        
        // Add content to collection
        addToCollection: async (contentId: string, collectionId: string) => {
          try {
            const { allContent, collections } = get();
            const content = allContent.find(item => item.id === contentId);
            
            if (!content) {
              throw new Error(`Content with ID ${contentId} not found`);
            }
            
            // Update content with new collection
            const updatedCollections = content.collections || [];
            if (!updatedCollections.includes(collectionId)) {
              updatedCollections.push(collectionId);
              await get().editContent(contentId, { collections: updatedCollections });
            }
            
            // Update collection content count
            const collection = collections.find(item => item.id === collectionId);
            if (collection) {
              await get().editCollection(collectionId, { 
                contentCount: collection.contentCount + 1 
              });
            }
          } catch (error) {
            console.error('Error adding to collection:', error);
            set({ error: error as Error });
            throw error;
          }
        },
        
        // Remove content from collection
        removeFromCollection: async (contentId: string, collectionId: string) => {
          try {
            const { allContent, collections } = get();
            const content = allContent.find(item => item.id === contentId);
            
            if (!content) {
              throw new Error(`Content with ID ${contentId} not found`);
            }
            
            // Update content with collection removed
            const updatedCollections = content.collections?.filter(id => id !== collectionId) || [];
            await get().editContent(contentId, { collections: updatedCollections });
            
            // Update collection content count
            const collection = collections.find(item => item.id === collectionId);
            if (collection && collection.contentCount > 0) {
              await get().editCollection(collectionId, { 
                contentCount: collection.contentCount - 1 
              });
            }
          } catch (error) {
            console.error('Error removing from collection:', error);
            set({ error: error as Error });
            throw error;
          }
        }
      }),
      {
        name: 'yaeger-content-store',
        partialize: (state) => ({
          selectedContent: state.selectedContent,
          selectedCollection: state.selectedCollection
        })
      }
    )
  )
);
