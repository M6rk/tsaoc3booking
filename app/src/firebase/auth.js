import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin based on email
  const isAdmin = (email) => {
    const adminEmail = process.env.REACT_APP_ADMIN_USERNAME || 'admin@salvationarmy.ca';
    return email === adminEmail;
  };

  // Get user profile from Firestore users collection
  const getUserProfile = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  // Create Firebase Auth user and profile
  const createUserAccount = async (email, password, name, fleet = false) => {
    try {
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email,
        fleet,
        role: isAdmin(email) ? 'admin' : 'user',
        createdAt: new Date(),
        authUid: result.user.uid // Link to Firebase Auth UID
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Production Sign In - Firebase Auth + Profile validation
  const login = async (email, password) => {
    try {
      // Admin login using environment variables (bypass Firebase Auth)
      const adminEmail = process.env.REACT_APP_ADMIN_USERNAME;
      const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
      
      if (email === adminEmail && password === adminPassword) {
        const adminUser = {
          uid: 'admin',
          email: adminEmail,
          isAdmin: true
        };
        
        setCurrentUser(adminUser);
        setUserRole('admin');
        setUserProfile({ name: 'Administrator', email: adminEmail, role: 'admin' });
        return { user: adminUser };
      }

      // Regular user login - Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Validate user exists in users collection
      const profile = await getUserProfile(email);
      if (!profile) {
        // User authenticated but not in users collection
        await signOut(auth);
        throw new Error('Account not found. Please contact an administrator.');
      }

      // Set user data
      setUserProfile(profile);
      setUserRole(profile.role || 'user');
      
      return result;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      }
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      if (currentUser?.uid !== 'admin') {
        await signOut(auth);
      }
      setCurrentUser(null);
      setUserRole(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  // Get all users (admin only)
  const getAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  };

  // Monitor Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && currentUser?.uid !== 'admin') {
        setCurrentUser(user);
        
        // Get user profile from Firestore
        const profile = await getUserProfile(user.email);
        if (profile) {
          setUserProfile(profile);
          setUserRole(profile.role || 'user');
        } else {
          // User exists in Firebase Auth but not in users collection
          console.warn('User authenticated but no profile found');
          await signOut(auth);
        }
      } else if (!user && currentUser?.uid !== 'admin') {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Handle admin user loading
  useEffect(() => {
    if (currentUser?.uid === 'admin') {
      setLoading(false);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    login,
    logout,
    createUserAccount,
    getAllUsers,
    isAdmin: userRole === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};