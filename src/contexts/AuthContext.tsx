import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../utils/api';
import { AuthUser } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Test backend connectivity
        await apiClient.healthCheck();
        
        // Check for stored auth data on app load
        const storedAuth = localStorage.getItem('auth_session');
        if (storedAuth) {
          try {
            const authData = JSON.parse(storedAuth);
            setUser(authData.user);
            apiClient.setAccessToken(authData.accessToken);
          } catch (error) {
            console.error('Error parsing stored auth:', error);
            localStorage.removeItem('auth_session');
          }
        }
      } catch (error) {
        console.error('Backend connectivity issue:', error);
        toast.error('Unable to connect to server. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting signin with:', email);
      
      const response = await apiClient.signin(email, password);
      console.log('Signin successful:', response);
      
      setUser(response.user);
      
      // Store auth data
      localStorage.setItem('auth_session', JSON.stringify(response));
      
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Signin error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      setIsLoading(true);
      await apiClient.signup(data);
      toast.success('Account created successfully! Please sign in.');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signout = () => {
    setUser(null);
    apiClient.setAccessToken(null);
    localStorage.removeItem('auth_session');
    toast.success('Successfully signed out');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      signin,
      signup,
      signout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};