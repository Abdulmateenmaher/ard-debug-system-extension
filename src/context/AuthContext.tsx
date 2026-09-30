import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, testFirestoreConnection } from '../firebase/firebase';
import { UserProfile, UserRole } from '../types/qa';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  firestoreOnline: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchPersona: (role: UserRole, customName?: string) => void;
  updateUserRoleOrRestriction: (uid: string, updates: Partial<UserProfile>) => void;
}

const DEFAULT_DEMO_USERS: Record<UserRole, UserProfile> = {
  debugger: {
    uid: 'qa_user_debugger_01',
    email: 'alex.qa@bugpulse.internal',
    displayName: 'Alex Rivers (QA Tester)',
    role: 'debugger',
    isRestricted: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  fixer: {
    uid: 'dev_user_fixer_01',
    email: 'sarah.dev@bugpulse.internal',
    displayName: 'Sarah Chen (Lead Fixer / Dev)',
    role: 'fixer',
    isRestricted: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  admin: {
    uid: 'admin_user_01',
    email: 'abdulmateenmaher23@gmail.com',
    displayName: 'Admin Maher',
    role: 'admin',
    isRestricted: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check saved persona from localStorage or start as QA Debugger
    const saved = localStorage.getItem('bugpulse_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_DEMO_USERS.debugger;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [firestoreOnline, setFirestoreOnline] = useState<boolean>(false);

  useEffect(() => {
    testFirestoreConnection().then(status => setFirestoreOnline(status));

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const profileData = snap.data() as UserProfile;
            setUser(profileData);
            localStorage.setItem('bugpulse_active_user', JSON.stringify(profileData));
          } else {
            // Create user profile in Firestore
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || 'user@test.com',
              displayName: fbUser.displayName || 'QA Member',
              role: fbUser.email?.includes('admin') ? 'admin' : 'debugger',
              isRestricted: false,
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {
              console.warn('Local profile persisted:', err);
            }
            setUser(newProfile);
            localStorage.setItem('bugpulse_active_user', JSON.stringify(newProfile));
          }
        } catch (err) {
          console.warn('Auth state sync fallback to local store');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', res.user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const u = snap.data() as UserProfile;
        setUser(u);
        localStorage.setItem('bugpulse_active_user', JSON.stringify(u));
      }
    } catch (error) {
      // If Firebase Auth project is in sandbox or user is testing offline, provide smart fallback
      console.warn('Firebase Auth notice, signing in locally:', error);
      const matchedRole: UserRole = email.includes('admin') ? 'admin' : email.includes('dev') || email.includes('fixer') ? 'fixer' : 'debugger';
      const fallbackUser: UserProfile = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
        role: matchedRole,
        isRestricted: false,
        createdAt: new Date().toISOString()
      };
      setUser(fallbackUser);
      localStorage.setItem('bugpulse_active_user', JSON.stringify(fallbackUser));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name: string, role: UserRole = 'debugger') => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        role,
        isRestricted: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUser(newProfile);
      localStorage.setItem('bugpulse_active_user', JSON.stringify(newProfile));
    } catch (error) {
      console.warn('Firebase registration notice, creating local user session:', error);
      const fallbackUser: UserProfile = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: name,
        role,
        isRestricted: false,
        createdAt: new Date().toISOString()
      };
      setUser(fallbackUser);
      localStorage.setItem('bugpulse_active_user', JSON.stringify(fallbackUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    // Default back to debugger demo
    const defaultUser = DEFAULT_DEMO_USERS.debugger;
    setUser(defaultUser);
    localStorage.setItem('bugpulse_active_user', JSON.stringify(defaultUser));
  };

  const switchPersona = (role: UserRole, customName?: string) => {
    const template = DEFAULT_DEMO_USERS[role];
    const newPersona: UserProfile = {
      ...template,
      displayName: customName || template.displayName
    };
    setUser(newPersona);
    localStorage.setItem('bugpulse_active_user', JSON.stringify(newPersona));
  };

  const updateUserRoleOrRestriction = (uid: string, updates: Partial<UserProfile>) => {
    if (user && user.uid === uid) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('bugpulse_active_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      firestoreOnline,
      signIn,
      signUp,
      logout,
      switchPersona,
      updateUserRoleOrRestriction
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
