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

  // Check if user is admin based on Firebase Auth custom claims or email
  const isAdmin = async (user) => {
    if (!user) return false;
    
    try {
      // Get the ID token to check custom claims
      const idTokenResult = await user.getIdTokenResult();
      
      // Check if role is set to admin in custom claims
      if (idTokenResult.claims.role === 'admin') {
        return true;
      }
      
      // Fallback: check email for backwards compatibility
      return user.email === 'admin@salvationarmy.ca';
    } catch (error) {
      console.error('Error checking admin status:', error);
      // Fallback to email check if custom claims fail
      return user.email === 'admin@salvationarmy.ca';
    }
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

  // Create Firebase Auth user and profile (for regular users only)
  const createUserAccount = async (email, password, name, fleet = false) => {
    try {
      // Prevent creating admin accounts through the app
      if (email === 'admin@salvationarmy.ca') {
        throw new Error('Admin accounts can only be created through Firebase Console');
      }

      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email,
        fleet,
        role: 'user',
        createdAt: new Date(),
        authUid: result.user.uid
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  };

// Update the login function with more debugging:

const login = async (email, password) => {
  try {
    console.log('Attempting login with:', email);
    
    // All users (including admin) authenticate through Firebase Auth
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase Auth successful:', result.user.email);
    
    // Check if user is admin (simplified)
    const userIsAdmin = isAdmin(result.user);
    console.log('Is admin?', userIsAdmin);
    
    if (userIsAdmin) {
      // Admin user - no profile needed in Firestore
      setUserRole('admin');
      setUserProfile({ 
        name: 'Administrator', 
        email: email, 
        role: 'admin' 
      });
      console.log('Admin login complete');
    } else {
      // Regular user - validate profile exists in Firestore
      console.log('Checking user profile...');
      const profile = await getUserProfile(email);
      
      if (!profile) {
        console.log('No profile found, signing out');
        await signOut(auth);
        throw new Error('Account not found. Please contact an administrator.');
      }
      
      console.log('User profile found:', profile);
      setUserProfile(profile);
      setUserRole(profile.role || 'user');
    }
    
    return result;
  } catch (error) {
    console.error('Login error details:', error);
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

  // Get all users (admin only) - exclude admin from user list
  const getAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      usersSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        // Don't include admin accounts in user management
        if (userData.email !== 'admin@salvationarmy.ca') {
          users.push(userData);
        }
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
        
        // Check if user is admin using custom claims
        const userIsAdmin = await isAdmin(user);
        
        if (userIsAdmin) {
          // Admin user
          setUserRole('admin');
          setUserProfile({ 
            name: 'Administrator', 
            email: user.email, 
            role: 'admin' 
          });
        } else {
          // Regular user - get profile from Firestore
          const profile = await getUserProfile(user.email);
          if (profile) {
            setUserProfile(profile);
            setUserRole(profile.role || 'user');
          } else {
            console.warn('User authenticated but no profile found');
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