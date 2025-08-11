// filepath: c:\tsaoc3booking\app\src\firebase\auth.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);

  // Check if user is admin based on email
  const isAdmin = (email) => {
    return email === 'oc3admin@sa.ca';
  };

  // Get user profile from Firestore
  const getUserProfile = async (uid, email) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        // Create user profile if it doesn't exist
        const role = isAdmin(email) ? 'admin' : 'user';
        const profile = {
          email,
          role,
          createdAt: new Date(),
          displayName: email.split('@')[0]
        };
        await setDoc(doc(db, 'users', uid), profile);
        return profile;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  // Sign in function
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(result.user.uid, email);
      setUserRole(profile?.role);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      throw error;
    }
  };

  // Create new user (admin only)
  const createUser = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const role = isAdmin(email) ? 'admin' : 'user';
      
      // Create user profile
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role,
        createdAt: new Date(),
        displayName: email.split('@')[0]
      });
      
      return result;
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

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await getUserProfile(user.uid, user.email);
        setUserRole(profile?.role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    logout,
    createUser,
    getAllUsers,
    isAdmin: userRole === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};