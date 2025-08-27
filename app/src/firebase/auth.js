import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
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

  // Check if user is admin
  const isAdmin = (user) => {
    if (!user) return false;
    return user.email === process.env.REACT_APP_FIREBASE_ADMIN_EMAIL;
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Check if user is admin
      const userIsAdmin = isAdmin(result.user);

      if (userIsAdmin) {
        // Admin user
        try {
          const profile = await getUserProfile(email);
          if (profile) {
            setUserProfile(profile);
            setUserRole('admin');
          } else {
            setUserRole('admin');
            setUserProfile({
              name: 'Administrator',
              email: email,
              role: 'admin',
              fleet: true
            });
          }
        } catch (error) {
          setUserRole('admin');
          setUserProfile({
            name: 'Administrator',
            email: email,
            role: 'admin',
            fleet: true
          });
        }
      } else {
        // Regular user
        const profile = await getUserProfile(email);

        if (!profile) {
          await signOut(auth);
          throw new Error('Account not found. Please contact an administrator.');
        }
        setUserProfile(profile);
        setUserRole(profile.role || 'user');
      }

      return result;
    } catch (error) {
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

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
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  // Get all users
  const getAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      usersSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        users.push(userData);
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
      if (user) {
        setCurrentUser(user);

        // Check if user is admin (synchronous)
        const userIsAdmin = isAdmin(user);

        if (userIsAdmin) {
          try {
            const profile = await getUserProfile(user.email);
            if (profile) {
              setUserProfile(profile);
              setUserRole('admin');
            } else {
              setUserRole('admin');
              setUserProfile({
                name: 'Administrator',
                email: user.email,
                role: 'admin',
                fleet: true
              });
            }
          } catch (error) {
            setUserRole('admin');
            setUserProfile({
              name: 'Administrator',
              email: user.email,
              role: 'admin',
              fleet: true
            });
          }
        } else {
          // Regular user
          try {
            const profile = await getUserProfile(user.email);
            if (profile) {
              setUserProfile(profile);
              setUserRole(profile.role || 'user');
            } else {
              console.warn('User authenticated but no profile found');
              await signOut(auth);
            }
          } catch (error) {
            console.error('Error getting user profile:', error);
            await signOut(auth);
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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