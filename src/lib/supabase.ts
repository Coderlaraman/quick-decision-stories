import { createClient } from '@supabase/supabase-js';
import { logger, LogCategory } from '../utils/logger';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn(LogCategory.AUTH, 'Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos para la base de datos
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  story_id: string;
  started_at: string;
  completed_at?: string;
  choices_made: any[];
  ending_reached?: string;
  total_time_seconds?: number;
}

export interface UserStats {
  id: string;
  user_id: string;
  stories_completed: number;
  total_endings_unlocked: number;
  total_play_time_seconds: number;
  achievements: string[];
  created_at: string;
  updated_at: string;
}

// Funciones de autenticación
export const authService = {
  // Registrar nuevo usuario
  async signUp(email: string, password: string, username?: string) {
    try {
      logger.info(LogCategory.AUTH, 'Attempting user registration', { email, username });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) {
        logger.error(LogCategory.AUTH, 'Registration failed', error);
        throw error;
      }

      logger.info(LogCategory.AUTH, 'User registered successfully', { userId: data.user?.id });
      return data;
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Registration error', error);
      throw error;
    }
  },

  // Iniciar sesión
  async signIn(email: string, password: string) {
    try {
      logger.info(LogCategory.AUTH, 'Attempting user login', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error(LogCategory.AUTH, 'Login failed', error);
        throw error;
      }

      logger.info(LogCategory.AUTH, 'User logged in successfully', { userId: data.user?.id });
      return data;
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Login error', error);
      throw error;
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      logger.info(LogCategory.AUTH, 'Attempting user logout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error(LogCategory.AUTH, 'Logout failed', error);
        throw error;
      }

      logger.info(LogCategory.AUTH, 'User logged out successfully');
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Logout error', error);
      throw error;
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        logger.error(LogCategory.AUTH, 'Failed to get current user', error);
        throw error;
      }

      return user;
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Get current user error', error);
      throw error;
    }
  },

  // Restablecer contraseña
  async resetPassword(email: string) {
    try {
      logger.info(LogCategory.AUTH, 'Attempting password reset', { email });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        logger.error(LogCategory.AUTH, 'Password reset failed', error);
        throw error;
      }

      logger.info(LogCategory.AUTH, 'Password reset email sent successfully');
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Password reset error', error);
      throw error;
    }
  }
};

// Funciones para el perfil de usuario
export const profileService = {
  // Obtener perfil de usuario
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        logger.error(LogCategory.USER, 'Failed to get user profile', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(LogCategory.USER, 'Get profile error', error);
      throw error;
    }
  },

  // Actualizar perfil de usuario
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      logger.info(LogCategory.USER, 'Updating user profile', { userId, updates });
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error(LogCategory.USER, 'Failed to update profile', error);
        throw error;
      }

      logger.info(LogCategory.USER, 'Profile updated successfully');
      return data;
    } catch (error) {
      logger.error(LogCategory.USER, 'Update profile error', error);
      throw error;
    }
  }
};

// Funciones para estadísticas del juego
export const gameStatsService = {
  // Guardar sesión de juego
  async saveGameSession(session: Omit<GameSession, 'id'>) {
    try {
      logger.info(LogCategory.GAME, 'Saving game session', session);
      
      const { data, error } = await supabase
        .from('game_sessions')
        .insert(session)
        .select()
        .single();

      if (error) {
        logger.error(LogCategory.GAME, 'Failed to save game session', error);
        throw error;
      }

      logger.info(LogCategory.GAME, 'Game session saved successfully');
      return data;
    } catch (error) {
      logger.error(LogCategory.GAME, 'Save game session error', error);
      throw error;
    }
  },

  // Obtener estadísticas del usuario
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error(LogCategory.GAME, 'Failed to get user stats', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error(LogCategory.GAME, 'Get user stats error', error);
      throw error;
    }
  },

  // Actualizar estadísticas del usuario
  async updateUserStats(userId: string, stats: Partial<UserStats>) {
    try {
      logger.info(LogCategory.GAME, 'Updating user stats', { userId, stats });
      
      const { data, error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          ...stats,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error(LogCategory.GAME, 'Failed to update user stats', error);
        throw error;
      }

      logger.info(LogCategory.GAME, 'User stats updated successfully');
      return data;
    } catch (error) {
      logger.error(LogCategory.GAME, 'Update user stats error', error);
      throw error;
    }
  }
};

// Listener para cambios de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  logger.info(LogCategory.AUTH, `Auth state changed: ${event}`, {
    userId: session?.user?.id,
    email: session?.user?.email
  });
});