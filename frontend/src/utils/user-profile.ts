import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  lastLogin: number;
}

// Create or update user profile in Firestore
export const saveUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    const timestamp = Date.now();
    let userData: Partial<UserProfile>;
    
    if (userSnap.exists()) {
      // Update existing user
      userData = {
        ...data,
        lastLogin: timestamp,
      };
    } else {
      // Create new user
      userData = {
        uid,
        email: data.email || '',
        displayName: data.displayName || '',
        photoURL: data.photoURL || '',
        createdAt: timestamp,
        lastLogin: timestamp,
        ...data,
      };
    }
    
    await setDoc(userRef, userData, { merge: true });
    return userData;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Log user activity
export const logUserActivity = async (uid: string, action: string, details?: any) => {
  try {
    const logRef = doc(db, 'logs', `${uid}_${Date.now()}`);
    await setDoc(logRef, {
      uid,
      action,
      details,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};
