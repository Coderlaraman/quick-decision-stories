import { supabase } from '../supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  tier: 'premium' | 'pro' | 'ultimate';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}

export interface SubscriptionStats {
  totalSubscribers: number;
  exclusiveStories: number;
  exclusiveEvents: number;
  averageRating: number;
}

class SubscriptionApiService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    // Mock data for now - replace with actual API call
    return [
      {
        id: 'premium-monthly',
        name: 'Premium',
        price: 9.99,
        interval: 'month',
        features: [
          'Access to premium stories',
          'Ad-free experience',
          'Priority support'
        ]
      },
      {
        id: 'premium-yearly',
        name: 'Premium',
        price: 99.99,
        interval: 'year',
        features: [
          'Access to premium stories',
          'Ad-free experience',
          'Priority support',
          'Save 20% with yearly billing'
        ],
        popular: true
      },
      {
        id: 'pro-monthly',
        name: 'Pro',
        price: 19.99,
        interval: 'month',
        features: [
          'All Premium features',
          'Exclusive author content',
          'Early access to new stories',
          'Advanced analytics'
        ]
      },
      {
        id: 'pro-yearly',
        name: 'Pro',
        price: 199.99,
        interval: 'year',
        features: [
          'All Premium features',
          'Exclusive author content',
          'Early access to new stories',
          'Advanced analytics',
          'Save 20% with yearly billing'
        ]
      }
    ];
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        planId: data.plan_id,
        planName: data.plan_name,
        tier: data.tier,
        status: data.status,
        currentPeriodEnd: data.current_period_end
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    // Mock data for now - replace with actual API calls
    return {
      totalSubscribers: 1250,
      exclusiveStories: 45,
      exclusiveEvents: 12,
      averageRating: 4.8
    };
  }

  async subscribeToPlan(planId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would integrate with a payment processor like Stripe
      // For now, we'll just simulate the subscription creation
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          created_at: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to create subscription' };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'canceled' })
        .eq('id', subscriptionId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }

  async updatePaymentMethod(_paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would integrate with payment processor
      // For now, just simulate success
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update payment method' };
    }
  }
}

export const subscriptionApi = new SubscriptionApiService();