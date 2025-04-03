// Content type definitions for YAEGER portfolio app

// Base content item interface that all content types extend
export interface BaseContent {
  id: string;             // Unique identifier for the content
  userId: string;         // User who owns this content
  title: string;          // Title of the content
  description?: string;   // Optional description
  tags?: string[];        // Optional tags for categorization
  createdAt: number;      // Timestamp when content was created
  updatedAt: number;      // Timestamp when content was last updated
  type: ContentType;      // Type of content (photo, document, etc.)
  isFavorite: boolean;    // Whether this is a favorite item
  isPublic: boolean;      // Whether this content is public
  collections?: string[]; // IDs of collections this content belongs to
}

// Enum for all possible content types
export enum ContentType {
  PHOTO = 'photo',
  DOCUMENT = 'document',
  CODE = 'code',
  NOTE = 'note',
  ART = 'art',
  LINK = 'link'
}

// Photo content type
export interface PhotoContent extends BaseContent {
  type: ContentType.PHOTO;
  storageRef: string;     // Reference to image in Firebase Storage
  thumbnailRef?: string;  // Reference to thumbnail in Firebase Storage
  dimensions?: {          // Image dimensions
    width: number;
    height: number;
  };
  location?: {            // Optional geolocation data
    latitude: number;
    longitude: number;
    name?: string;
  };
  camera?: string;        // Optional camera information
}

// Document content type
export interface DocumentContent extends BaseContent {
  type: ContentType.DOCUMENT;
  storageRef: string;     // Reference to document in Firebase Storage
  fileType: string;       // File type (PDF, DOCX, etc.)
  fileSize: number;       // Size in bytes
  previewRef?: string;    // Reference to preview image
}

// Code/script content type
export interface CodeContent extends BaseContent {
  type: ContentType.CODE;
  language: string;       // Programming language
  code: string;           // Actual code content (stored as text)
  runnable?: boolean;     // Whether this code is runnable
}

// Note content type
export interface NoteContent extends BaseContent {
  type: ContentType.NOTE;
  content: string;        // Note content (Markdown supported)
  color?: string;         // Optional background color
}

// Art content type
export interface ArtContent extends BaseContent {
  type: ContentType.ART;
  storageRef: string;     // Reference to art image in Firebase Storage
  medium?: string;        // Type of art (digital, painting, etc.)
  dimensions?: {          // Image dimensions
    width: number;
    height: number;
  };
}

// Link content type
export interface LinkContent extends BaseContent {
  type: ContentType.LINK;
  url: string;            // URL of the link
  favicon?: string;       // Favicon URL
  ogImage?: string;       // Open Graph image URL
  siteName?: string;      // Name of the site
}

// Union type for all content types
export type Content = 
  | PhotoContent 
  | DocumentContent 
  | CodeContent 
  | NoteContent
  | ArtContent
  | LinkContent;

// Collection interface for grouping content
export interface ContentCollection {
  id: string;             // Unique identifier for the collection
  userId: string;         // User who owns this collection
  name: string;           // Collection name
  description?: string;   // Optional description
  coverImage?: string;    // Optional cover image reference
  createdAt: number;      // Timestamp when collection was created
  updatedAt: number;      // Timestamp when collection was last updated
  contentCount: number;   // Number of content items in this collection
  isPublic: boolean;      // Whether this collection is public
  color?: string;         // Optional theme color
}

// Visual properties for content spheres display
export interface ContentSphereVisual {
  baseColor: string;      // Base color for the content sphere
  scale: number;          // Scale factor (0.8-1.5)
  orbitSpeed: number;     // Speed of orbit animation (0.1-1.0)
  pulseIntensity: number; // Intensity of pulsing effect (0.1-1.0)
  distortion: number;     // Level of sphere distortion (0.0-0.5)
}

// Map each content type to its default visual properties
export const contentTypeVisuals: Record<ContentType, ContentSphereVisual> = {
  [ContentType.PHOTO]: {
    baseColor: '#8855ff',
    scale: 1.2,
    orbitSpeed: 0.3,
    pulseIntensity: 0.5,
    distortion: 0.2
  },
  [ContentType.DOCUMENT]: {
    baseColor: '#4466ff',
    scale: 1.3,
    orbitSpeed: 0.2,
    pulseIntensity: 0.3,
    distortion: 0.1
  },
  [ContentType.CODE]: {
    baseColor: '#ff5588',
    scale: 1.0,
    orbitSpeed: 0.4,
    pulseIntensity: 0.7,
    distortion: 0.3
  },
  [ContentType.NOTE]: {
    baseColor: '#55ffaa',
    scale: 0.9,
    orbitSpeed: 0.35,
    pulseIntensity: 0.4,
    distortion: 0.15
  },
  [ContentType.ART]: {
    baseColor: '#ffaa55',
    scale: 1.4,
    orbitSpeed: 0.25,
    pulseIntensity: 0.6,
    distortion: 0.25
  },
  [ContentType.LINK]: {
    baseColor: '#55aaff',
    scale: 0.9,
    orbitSpeed: 0.3,
    pulseIntensity: 0.4,
    distortion: 0.2
  }
};
