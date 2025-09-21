import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, authService, profileService, UserProfile } from '../lib/supabase';
import { logger, LogCategory } from '../utils/logger';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  });

  // Cargar perfil del usuario
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await profileService.getProfile(userId);
      setState(prev => ({ ...prev, profile }));
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Failed to load user profile', error);
    }
  }, []);

  // Inicializar autenticación
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Obtener sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error(LogCategory.AUTH, 'Failed to get session', error);
          if (mounted) {
            setState(prev => ({ 
              ...prev, 
              loading: false, 
              error: error.message 
            }));
          }
          return;
        }

        if (mounted) {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user || null,
            loading: false
          }));

          // Cargar perfil si hay usuario
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      } catch (error) {
        logger.error(LogCategory.AUTH, 'Auth initialization error', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Failed to initialize authentication' 
          }));
        }
      }
    };

    initializeAuth();

    // Listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(LogCategory.AUTH, `Auth state changed: ${event}`);
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user || null,
            profile: session?.user ? prev.profile : null,
            loading: false,
            error: null
          }));

          // Cargar perfil para nuevo usuario
          if (session?.user && event === 'SIGNED_IN') {
            await loadUserProfile(session.user.id);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Registrar usuario
  const signUp = useCallback(async (email: string, password: string, username?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.signUp(email, password, username);
      // El estado se actualizará automáticamente por el listener
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Registration failed' 
      }));
      throw error;
    }
  }, []);

  // Iniciar sesión
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.signIn(email, password);
      // El estado se actualizará automáticamente por el listener
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Login failed' 
      }));
      throw error;
    }
  }, []);

  // Cerrar sesión
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.signOut();
      // El estado se actualizará automáticamente por el listener
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Logout failed' 
      }));
      throw error;
    }
  }, []);

  // Restablecer contraseña
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.resetPassword(email);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Password reset failed' 
      }));
      throw error;
    }
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedProfile = await profileService.updateProfile(state.user.id, updates);
      setState(prev => ({ 
        ...prev, 
        profile: updatedProfile, 
        loading: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Profile update failed' 
      }));
      throw error;
    }
  }, [state.user]);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    clearError
  };
}