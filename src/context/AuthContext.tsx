import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canManageSettings: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (user: User) => void;
  updateAdminCredentials: (newUsername: string, newPassword: string, newName?: string) => Promise<{ success: boolean; message: string }>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  getAdminCredentials: () => { username: string; password?: string; name: string };
}

const AUTH_STORAGE_KEY = 'panchayat_connect_auth_user';
const USERS_STORAGE_KEY = 'panchayat_connect_users';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getAvailableUsers = (): User[] => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(u => ({
            ...u,
            password: u.password || (u.role === 'Super Admin' ? 'super123' : u.role === 'Admin' ? 'admin123' : u.role === 'Viewer' ? 'viewer123' : 'field123')
          }));
        }
      }
    } catch (e) {
      // fallback to initial
    }
    return INITIAL_USERS;
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    const available = getAvailableUsers();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Find matching freshest user from available users to keep password/username synced
        const matched = available.find(u => u.id === parsed.id || u.username === parsed.username);
        if (matched) return matched;
        return parsed;
      } catch (e) {
        return available[0] || INITIAL_USERS[0];
      }
    }
    // Default logged in as Primary Administrator
    return available[0] || INITIAL_USERS[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Listen to users updated externally (e.g. from DatabaseContext or other tabs)
  useEffect(() => {
    const handleUsersUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && currentUser) {
        const updatedSelf = e.detail.find((u: User) => u.id === currentUser.id);
        if (updatedSelf) {
          setCurrentUser(updatedSelf);
        }
      }
    };
    window.addEventListener('panchayat_connect_users_updated', handleUsersUpdated);
    return () => window.removeEventListener('panchayat_connect_users_updated', handleUsersUpdated);
  }, [currentUser]);

  const login = async (usernameOrEmail: string, password?: string) => {
    const allUsers = getAvailableUsers();
    const cleanInput = (usernameOrEmail || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    if (!cleanInput) {
      return { success: false, message: 'Please enter a username or email address.' };
    }

    // Check credentials against initial/saved users
    const user = allUsers.find(
      u => u.username.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
    );

    if (user) {
      const expectedPassword = user.password || (user.role === 'Admin' ? 'admin123' : user.role === 'Super Admin' ? 'super123' : 'field123');
      if (inputPassword !== expectedPassword) {
        return {
          success: false,
          message: `Incorrect password for @${user.username}. (Default was '${expectedPassword}' if unedited)`
        };
      }
      setCurrentUser(user);
      return { success: true };
    }

    // Allow generic admin login fallback if user entered 'admin' but the primary admin has username 'admin'
    const adminUser = allUsers.find(u => u.role === 'Admin' || u.role === 'Super Admin') || INITIAL_USERS[0];
    if (cleanInput === 'admin' || cleanInput === adminUser.username.toLowerCase()) {
      const expectedPassword = adminUser.password || 'admin123';
      if (inputPassword === expectedPassword) {
        setCurrentUser(adminUser);
        return { success: true };
      }
      return { success: false, message: 'Incorrect admin password. Please try again.' };
    }

    return {
      success: false,
      message: 'Account not found. Please verify your username or use the Quick Demo login options below.'
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
  };

  const updateAdminCredentials = async (
    newUsername: string,
    newPassword: string,
    newName?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUsername = newUsername.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPassword = newPassword.trim();

    if (!cleanUsername) {
      return { success: false, message: 'Username cannot be empty.' };
    }
    if (cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters long.' };
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const allUsers = getAvailableUsers();
    
    // Find current admin account or active admin user
    const adminIndex = allUsers.findIndex(u => 
      (currentUser && u.id === currentUser.id) || u.role === 'Admin' || u.role === 'Super Admin' || u.username === 'admin'
    );

    if (adminIndex === -1) {
      return { success: false, message: 'Admin user account could not be found.' };
    }

    // Check if new username conflicts with another existing user
    const conflict = allUsers.some((u, idx) => idx !== adminIndex && u.username.toLowerCase() === cleanUsername);
    if (conflict) {
      return { success: false, message: `Username "@${cleanUsername}" is already taken by another account.` };
    }

    const updatedAdmin: User = {
      ...allUsers[adminIndex],
      username: cleanUsername,
      password: cleanPassword,
      name: newName?.trim() || allUsers[adminIndex].name
    };

    allUsers[adminIndex] = updatedAdmin;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.error('Failed to save updated users to localStorage:', e);
    }

    // Update active currentUser
    setCurrentUser(updatedAdmin);

    // Notify DatabaseContext and any other components
    window.dispatchEvent(new CustomEvent('panchayat_connect_users_updated', { detail: allUsers }));

    return {
      success: true,
      message: `Admin credentials updated successfully! Username: @${cleanUsername}`
    };
  };

  const updateUserPassword = async (
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanPassword = newPassword.trim();
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const allUsers = getAvailableUsers();
    const targetIndex = allUsers.findIndex(u => u.id === userId);
    if (targetIndex === -1) {
      return { success: false, message: 'User account not found.' };
    }

    allUsers[targetIndex] = {
      ...allUsers[targetIndex],
      password: cleanPassword
    };

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    if (currentUser?.id === userId) {
      setCurrentUser(allUsers[targetIndex]);
    }

    window.dispatchEvent(new CustomEvent('panchayat_connect_users_updated', { detail: allUsers }));
    return { success: true, message: `Password updated for ${allUsers[targetIndex].name}.` };
  };

  const getAdminCredentials = () => {
    const allUsers = getAvailableUsers();
    const admin = allUsers.find(u => u.role === 'Admin' || u.role === 'Super Admin') || INITIAL_USERS[0];
    return {
      username: admin.username,
      password: admin.password || 'admin123',
      name: admin.name
    };
  };

  const currentRole: UserRole = currentUser?.role || 'Viewer';
  const isAuthenticated = !!currentUser;
  const isAdmin = currentRole === 'Super Admin' || currentRole === 'Admin';
  // Admin can edit and delete all things! Users can only fill data; delete only in admin panel by admin!
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canManageSettings = isAdmin;
  const canAdd = currentRole !== 'Viewer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        isAdmin,
        canEdit,
        canDelete,
        canAdd,
        canManageSettings,
        login,
        logout,
        switchRole,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
