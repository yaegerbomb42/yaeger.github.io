import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  GithubAuthProvider,
  TwitterAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { saveUserProfile } from './user-profile';

// Your web app's Firebase configuration
const firebaseConfig = {
  // Firebase will inject these values when the extension is installed
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Firebase auth functions
export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
};

export const registerWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Create user profile in Firestore
  if (userCredential.user) {
    await saveUserProfile(userCredential.user.uid, {
      email: userCredential.user.email || '',
      displayName: userCredential.user.displayName || '',
      photoURL: userCredential.user.photoURL || '',
    });
  }
  return userCredential;
};

export const loginWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  // Create or update user profile in Firestore
  if (userCredential.user) {
    await saveUserProfile(userCredential.user.uid, {
      email: userCredential.user.email || '',
      displayName: userCredential.user.displayName || '',
      photoURL: userCredential.user.photoURL || '',
    });
  }
  return userCredential;
};

export const loginWithGithub = async () => {
  const userCredential = await signInWithPopup(auth, githubProvider);
  // Create or update user profile in Firestore
  if (userCredential.user) {
    await saveUserProfile(userCredential.user.uid, {
      email: userCredential.user.email || '',
      displayName: userCredential.user.displayName || '',
      photoURL: userCredential.user.photoURL || '',
    });
  }
  return userCredential;
};

export const loginWithTwitter = async () => {
  const userCredential = await signInWithPopup(auth, twitterProvider);
  // Create or update user profile in Firestore
  if (userCredential.user) {
    await saveUserProfile(userCredential.user.uid, {
      email: userCredential.user.email || '',
      displayName: userCredential.user.displayName || '',
      photoURL: userCredential.user.photoURL || '',
    });
  }
  return userCredential;
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    // If user logs in, update their last login time in Firestore
    if (user) {
      try {
        await saveUserProfile(user.uid, {
          lastLogin: Date.now(),
        });
      } catch (error) {
        console.error('Error updating last login time:', error);
      }
    }
    callback(user);
  });
};

export { auth, db };

