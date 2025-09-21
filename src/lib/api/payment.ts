import { supabase } from '../supabase';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

class PaymentApiService {
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true);

      if (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }

      return data?.map(method => ({
        id: method.id,
        type: method.type,
        last4: method.last4,
        brand: method.brand,
        expiryMonth: method.expiry_month,
        expiryYear: method.expiry_year,
        isDefault: method.is_default
      })) || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(userId: string, paymentMethodData: Omit<PaymentMethod, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          type: paymentMethodData.type,
          last4: paymentMethodData.last4,
          brand: paymentMethodData.brand,
          expiry_month: paymentMethodData.expiryMonth,
          expiry_year: paymentMethodData.expiryYear,
          is_default: paymentMethodData.isDefault,
          active: true,
          created_at: new Date().toISOString()
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to add payment method' };
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ active: false })
        .eq('id', paymentMethodId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to remove payment method' };
    }
  }

  async setDefaultPaymentMethod(paymentMethodId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, unset all other default payment methods for this user
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to set default payment method' };
    }
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          payment_methods(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return data?.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.created_at,
        paymentMethod: {
          id: transaction.payment_methods.id,
          type: transaction.payment_methods.type,
          last4: transaction.payment_methods.last4,
          brand: transaction.payment_methods.brand,
          expiryMonth: transaction.payment_methods.expiry_month,
          expiryYear: transaction.payment_methods.expiry_year,
          isDefault: transaction.payment_methods.is_default
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent | null> {
    try {
      // This would integrate with Stripe or another payment processor
      // For now, we'll simulate creating a payment intent
      const mockPaymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        status: 'requires_payment_method'
      };

      return mockPaymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  async confirmPayment(): Promise<{ success: boolean; error?: string }> {
    try {
      // This would confirm the payment with the payment processor
      // For now, we'll simulate a successful payment
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Payment confirmation failed' };
    }
  }

  async processRefund(transactionId: string, amount?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_amount: amount
        })
        .eq('id', transactionId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Refund processing failed' };
    }
  }
}

export const paymentApi = new PaymentApiService();