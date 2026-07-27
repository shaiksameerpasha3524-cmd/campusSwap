-- ==========================================
-- CAMPUSSWAP DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Stores profile details for college students
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT,
    department TEXT,
    semester TEXT,
    phone TEXT,
    profile_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE
-- Stores academic marketplace items
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. MEMBERSHIPS TABLE
-- Stores membership transactions (₹49 for 30 days)
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    payment_id TEXT NOT NULL UNIQUE,
    amount NUMERIC NOT NULL CHECK (amount = 49),
    status TEXT NOT NULL CHECK (status IN ('active', 'expired')),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Memberships
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 4. REPORTS TABLE
-- Stores reported products and reasons
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 5. FAVORITES TABLE
-- Stores user's wishlisted items
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS on Favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 6. FUTURE_MESSAGES TABLE
-- Stores chat logs or prospective inquiries between buyer & seller
CREATE TABLE IF NOT EXISTS public.future_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Future Messages
ALTER TABLE public.future_messages ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by anyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can browse products" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upload products" 
ON public.products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = seller_id);

CREATE POLICY "Product owner can update product" 
ON public.products FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Product owner can delete product" 
ON public.products FOR DELETE 
USING (auth.uid() = seller_id);

-- Memberships policies
CREATE POLICY "Users can read their own memberships" 
ON public.memberships FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own membership purchase" 
ON public.memberships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can insert reports" 
ON public.reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" 
ON public.reports FOR SELECT 
USING (auth.uid() = reporter_id);

-- Favorites policies
CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Future Messages policies
CREATE POLICY "Users can view their own sent/received messages" 
ON public.future_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
ON public.future_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);


-- ==========================================
-- SYSTEM TRIGGERS FOR USER REGISTRATION
-- ==========================================

-- Automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, college, department, semester, phone, profile_photo)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'college', ''),
        COALESCE(new.raw_user_meta_data->>'department', ''),
        COALESCE(new.raw_user_meta_data->>'semester', ''),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'profile_photo', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 7. STORAGE BUCKETS & POLICIES CONFIGURATION
-- ==========================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop storage policies if they already exist to avoid errors
DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update/delete their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update/delete their own profile photos" ON storage.objects;

-- Storage Policies for 'product-images'
CREATE POLICY "Public Access to product-images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can update/delete their own product images" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage Policies for 'profile-photos'
CREATE POLICY "Public Access to profile-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update/delete their own profile photos" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

