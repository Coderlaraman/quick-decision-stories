-- Extended Quick Decision Stories - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to add new tables for community features

-- =============================================
-- COMMUNITY STORIES TABLES
-- =============================================

-- Table for community-created stories
CREATE TABLE IF NOT EXISTS public.community_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT,
    estimated_time INTEGER DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0.00,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Table for story scenes (community stories)
CREATE TABLE IF NOT EXISTS public.story_scenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES public.community_stories(id) ON DELETE CASCADE NOT NULL,
    scene_id TEXT NOT NULL, -- Internal scene identifier
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_ending BOOLEAN DEFAULT false,
    ending_type TEXT CHECK (ending_type IN ('happy', 'neutral', 'tragic', 'mysterious')),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, scene_id)
);

-- Table for story options
CREATE TABLE IF NOT EXISTS public.story_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scene_id UUID REFERENCES public.story_scenes(id) ON DELETE CASCADE NOT NULL,
    option_id TEXT NOT NULL, -- Internal option identifier
    text TEXT NOT NULL,
    next_scene_id TEXT, -- References scene_id in story_scenes
    is_default BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- GAMIFICATION TABLES
-- =============================================

-- User currency and points
CREATE TABLE IF NOT EXISTS public.user_currency (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    coins INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 0,
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements system
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    points_reward INTEGER DEFAULT 0,
    coins_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL, -- 'stories_completed', 'points', 'level', etc.
    score INTEGER NOT NULL,
    period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    period_start DATE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, period, period_start)
);

-- =============================================
-- MARKETPLACE TABLES
-- =============================================

-- Story purchases
CREATE TABLE IF NOT EXISTS public.story_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    story_id UUID REFERENCES public.community_stories(id) ON DELETE CASCADE NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id TEXT,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Creator earnings
CREATE TABLE IF NOT EXISTS public.creator_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    story_id UUID REFERENCES public.community_stories(id) ON DELETE CASCADE NOT NULL,
    purchase_id UUID REFERENCES public.story_purchases(id) ON DELETE CASCADE NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid', 'failed')),
    payout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTION TABLES
-- =============================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    stripe_price_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RATING AND REVIEW TABLES
-- =============================================

-- Story ratings and reviews
CREATE TABLE IF NOT EXISTS public.story_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    story_id UUID REFERENCES public.community_stories(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Creator reputation
CREATE TABLE IF NOT EXISTS public.creator_reputation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_stories INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MODERATION TABLES
-- =============================================

-- Content reports
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('story', 'review', 'profile')),
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES public.profiles(id),
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Community stories indexes
CREATE INDEX IF NOT EXISTS idx_community_stories_author_id ON public.community_stories(author_id);
CREATE INDEX IF NOT EXISTS idx_community_stories_published ON public.community_stories(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_community_stories_premium ON public.community_stories(is_premium);
CREATE INDEX IF NOT EXISTS idx_community_stories_moderation ON public.community_stories(moderation_status);
CREATE INDEX IF NOT EXISTS idx_community_stories_tags ON public.community_stories USING GIN(tags);

-- Story scenes and options indexes
CREATE INDEX IF NOT EXISTS idx_story_scenes_story_id ON public.story_scenes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_options_scene_id ON public.story_options(scene_id);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_currency_user_id ON public.user_currency(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_category_period ON public.leaderboards(category, period, period_start);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_story_purchases_user_id ON public.story_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_story_purchases_story_id ON public.story_purchases(story_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator_id ON public.creator_earnings(creator_id);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_story_reviews_story_id ON public.story_reviews(story_id);
CREATE INDEX IF NOT EXISTS idx_story_reviews_user_id ON public.story_reviews(user_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Community stories policies
CREATE POLICY "Users can view published stories" ON public.community_stories
    FOR SELECT USING (is_published = true AND moderation_status = 'approved');

CREATE POLICY "Authors can view their own stories" ON public.community_stories
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create stories" ON public.community_stories
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own stories" ON public.community_stories
    FOR UPDATE USING (auth.uid() = author_id);

-- Story scenes policies
CREATE POLICY "Users can view scenes of accessible stories" ON public.story_scenes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_stories cs 
            WHERE cs.id = story_id 
            AND (cs.is_published = true AND cs.moderation_status = 'approved' OR cs.author_id = auth.uid())
        )
    );

CREATE POLICY "Authors can manage their story scenes" ON public.story_scenes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.community_stories cs 
            WHERE cs.id = story_id AND cs.author_id = auth.uid()
        )
    );

-- Story options policies
CREATE POLICY "Users can view options of accessible scenes" ON public.story_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.story_scenes ss
            JOIN public.community_stories cs ON cs.id = ss.story_id
            WHERE ss.id = scene_id 
            AND (cs.is_published = true AND cs.moderation_status = 'approved' OR cs.author_id = auth.uid())
        )
    );

CREATE POLICY "Authors can manage their story options" ON public.story_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.story_scenes ss
            JOIN public.community_stories cs ON cs.id = ss.story_id
            WHERE ss.id = scene_id AND cs.author_id = auth.uid()
        )
    );

-- User currency policies
CREATE POLICY "Users can view their own currency" ON public.user_currency
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own currency" ON public.user_currency
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements
    FOR SELECT USING (is_active = true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Leaderboards policies (public read)
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboards
    FOR SELECT USING (true);

-- Story purchases policies
CREATE POLICY "Users can view their own purchases" ON public.story_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.story_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Creator earnings policies
CREATE POLICY "Creators can view their own earnings" ON public.creator_earnings
    FOR SELECT USING (auth.uid() = creator_id);

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Story reviews policies
CREATE POLICY "Anyone can view reviews" ON public.story_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.story_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.story_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Creator reputation policies (public read)
CREATE POLICY "Anyone can view creator reputation" ON public.creator_reputation
    FOR SELECT USING (true);

-- Content reports policies
CREATE POLICY "Users can create reports" ON public.content_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.content_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update user currency after profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_currency()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_currency (user_id, coins, gems)
    VALUES (NEW.id, 100, 5); -- Starting currency
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user currency
DROP TRIGGER IF EXISTS on_profile_created_currency ON public.profiles;
CREATE TRIGGER on_profile_created_currency
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_currency();

-- Function to update creator reputation
CREATE OR REPLACE FUNCTION public.update_creator_reputation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.creator_reputation (creator_id, total_stories, average_rating, total_reviews)
    SELECT 
        cs.author_id,
        COUNT(DISTINCT cs.id),
        COALESCE(AVG(sr.rating), 0),
        COUNT(sr.id)
    FROM public.community_stories cs
    LEFT JOIN public.story_reviews sr ON sr.story_id = cs.id
    WHERE cs.author_id = COALESCE(NEW.user_id, OLD.user_id)
    GROUP BY cs.author_id
    ON CONFLICT (creator_id) DO UPDATE SET
        total_stories = EXCLUDED.total_stories,
        average_rating = EXCLUDED.average_rating,
        total_reviews = EXCLUDED.total_reviews,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for creator reputation updates
CREATE TRIGGER update_reputation_on_story_change
    AFTER INSERT OR UPDATE OR DELETE ON public.community_stories
    FOR EACH ROW EXECUTE FUNCTION public.update_creator_reputation();

CREATE TRIGGER update_reputation_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.story_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_creator_reputation();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, points_reward, coins_reward) VALUES
('first_story_created', 'Crea tu primera historia', '✍️', 'creator', 100, 50),
('first_story_completed', 'Completa tu primera historia', '🎯', 'player', 50, 25),
('speed_reader', 'Completa una historia en menos de 2 minutos', '⚡', 'player', 75, 30),
('explorer', 'Desbloquea 5 finales diferentes', '🗺️', 'player', 150, 75),
('completionist', 'Completa 10 historias', '🏆', 'player', 300, 150),
('popular_creator', 'Recibe 100 valoraciones positivas', '⭐', 'creator', 500, 250),
('master_storyteller', 'Crea 5 historias publicadas', '📚', 'creator', 400, 200),
('community_favorite', 'Una de tus historias alcanza 4.5 estrellas', '💖', 'creator', 300, 150)
ON CONFLICT (name) DO NOTHING;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_period, features) VALUES
('Premium Monthly', 'Acceso completo a todas las funciones premium', 9.99, 'monthly', 
 '{"unlimited_stories": true, "premium_content": true, "advanced_editor": true, "priority_support": true}'),
('Premium Yearly', 'Acceso completo anual con descuento', 99.99, 'yearly', 
 '{"unlimited_stories": true, "premium_content": true, "advanced_editor": true, "priority_support": true, "yearly_discount": true}')
ON CONFLICT (name) DO NOTHING;