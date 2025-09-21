import { supabase } from '../supabase';

export interface Commission {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  clientId: string;
  clientName: string;
  authorId?: string;
  authorName?: string;
  category: string;
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommissionProposal {
  id: string;
  commissionId: string;
  authorId: string;
  authorName: string;
  proposedPrice: number;
  estimatedDelivery: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CommissionStats {
  totalCommissions: number;
  activeCommissions: number;
  completedCommissions: number;
  averageBudget: number;
  topCategories: { category: string; count: number }[];
}

class CommissionApiService {
  async getCommissions(filters?: {
    status?: Commission['status'];
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    clientId?: string;
    authorId?: string;
  }): Promise<Commission[]> {
    try {
      let query = supabase
        .from('commissions')
        .select(`
          *,
          clients:client_id(name),
          authors:author_id(name)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.minBudget) {
        query = query.gte('budget', filters.minBudget);
      }
      if (filters?.maxBudget) {
        query = query.lte('budget', filters.maxBudget);
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters?.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        return [];
      }

      return data?.map(commission => ({
        id: commission.id,
        title: commission.title,
        description: commission.description,
        budget: commission.budget,
        currency: commission.currency,
        deadline: commission.deadline,
        status: commission.status,
        clientId: commission.client_id,
        clientName: commission.clients?.name || 'Unknown Client',
        authorId: commission.author_id,
        authorName: commission.authors?.name || null,
        category: commission.category,
        requirements: commission.requirements || [],
        createdAt: commission.created_at,
        updatedAt: commission.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }
  }

  async getCommissionById(id: string): Promise<Commission | null> {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          clients:client_id(name),
          authors:author_id(name)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        budget: data.budget,
        currency: data.currency,
        deadline: data.deadline,
        status: data.status,
        clientId: data.client_id,
        clientName: data.clients?.name || 'Unknown Client',
        authorId: data.author_id,
        authorName: data.authors?.name || null,
        category: data.category,
        requirements: data.requirements || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching commission:', error);
      return null;
    }
  }

  async createCommission(commissionData: Omit<Commission, 'id' | 'createdAt' | 'updatedAt' | 'clientName' | 'authorName'>): Promise<{ success: boolean; commissionId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .insert({
          title: commissionData.title,
          description: commissionData.description,
          budget: commissionData.budget,
          currency: commissionData.currency,
          deadline: commissionData.deadline,
          status: commissionData.status,
          client_id: commissionData.clientId,
          author_id: commissionData.authorId,
          category: commissionData.category,
          requirements: commissionData.requirements,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, commissionId: data.id };
    } catch (error) {
      return { success: false, error: 'Failed to create commission' };
    }
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update commission' };
    }
  }

  async getCommissionProposals(commissionId: string): Promise<CommissionProposal[]> {
    try {
      const { data, error } = await supabase
        .from('commission_proposals')
        .select(`
          *,
          authors:author_id(name)
        `)
        .eq('commission_id', commissionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commission proposals:', error);
        return [];
      }

      return data?.map(proposal => ({
        id: proposal.id,
        commissionId: proposal.commission_id,
        authorId: proposal.author_id,
        authorName: proposal.authors?.name || 'Unknown Author',
        proposedPrice: proposal.proposed_price,
        estimatedDelivery: proposal.estimated_delivery,
        message: proposal.message,
        status: proposal.status,
        createdAt: proposal.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching commission proposals:', error);
      return [];
    }
  }

  async submitProposal(proposalData: Omit<CommissionProposal, 'id' | 'authorName' | 'createdAt'>): Promise<{ success: boolean; proposalId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('commission_proposals')
        .insert({
          commission_id: proposalData.commissionId,
          author_id: proposalData.authorId,
          proposed_price: proposalData.proposedPrice,
          estimated_delivery: proposalData.estimatedDelivery,
          message: proposalData.message,
          status: proposalData.status,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, proposalId: data.id };
    } catch (error) {
      return { success: false, error: 'Failed to submit proposal' };
    }
  }

  async updateProposalStatus(proposalId: string, status: CommissionProposal['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('commission_proposals')
        .update({ status })
        .eq('id', proposalId);

      if (error) {
        return { success: false, error: error.message };
      }

      // If proposal is accepted, update the commission with the author
      if (status === 'accepted') {
        const { data: proposal } = await supabase
          .from('commission_proposals')
          .select('commission_id, author_id')
          .eq('id', proposalId)
          .single();

        if (proposal) {
          await supabase
            .from('commissions')
            .update({ 
              author_id: proposal.author_id,
              status: 'in_progress',
              updated_at: new Date().toISOString()
            })
            .eq('id', proposal.commission_id);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update proposal status' };
    }
  }

  async getCommissionStats(): Promise<CommissionStats> {
    try {
      // Get total commissions
      const { count: totalCommissions } = await supabase
        .from('commissions')
        .select('*', { count: 'exact', head: true });

      // Get active commissions
      const { count: activeCommissions } = await supabase
        .from('commissions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      // Get completed commissions
      const { count: completedCommissions } = await supabase
        .from('commissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get average budget
      const { data: budgetData } = await supabase
        .from('commissions')
        .select('budget');

      const averageBudget = budgetData?.length 
        ? budgetData.reduce((sum, item) => sum + item.budget, 0) / budgetData.length 
        : 0;

      // Get top categories
      const { data: categoryData } = await supabase
        .from('commissions')
        .select('category');

      const categoryCount: { [key: string]: number } = {};
      categoryData?.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalCommissions: totalCommissions || 0,
        activeCommissions: activeCommissions || 0,
        completedCommissions: completedCommissions || 0,
        averageBudget,
        topCategories
      };
    } catch (error) {
      console.error('Error fetching commission stats:', error);
      return {
        totalCommissions: 0,
        activeCommissions: 0,
        completedCommissions: 0,
        averageBudget: 0,
        topCategories: []
      };
    }
  }
}

export const commissionApi = new CommissionApiService();