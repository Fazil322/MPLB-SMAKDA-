import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://fynyxwelqaekvebchlrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bnl4d2VscWFla3ZlYmNobHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzk1MzksImV4cCI6MjA3NzYxNTUzOX0.C91U3rAeflfxHKxoU2wfBExVcj3YSxABioOMmdQoE0I';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/*
================================================================================
PENTING: JALANKAN SEMUA SKRIP SQL INI DALAM SATU KALI EKSEKUSI
================================================================================
Aplikasi ini tidak akan berfungsi dengan benar sampai Anda menyalin *seluruh*
blok SQL di bawah ini dan menjalankannya di Editor SQL proyek Supabase Anda.
Skrip ini akan menyiapkan semua yang Anda butuhkan.
================================================================================

-- PANDUAN PENGGUNAAN:
-- 1. Buka Dasbor Supabase Anda.
-- 2. Pergi ke "SQL Editor".
-- 3. Klik "New query".
-- 4. Salin SEMUA teks dari `START OF SQL SCRIPT` hingga `END OF SQL SCRIPT`.
-- 5. Tempelkan ke editor SQL.
-- 6. Klik "RUN".

-- =============================================================================
-- START OF SQL SCRIPT
-- =============================================================================

-- BAGIAN 1: Aktifkan Ekstensi UUID
-- Dibutuhkan untuk membuat ID unik (UUID) untuk data baru di tabel Anda.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- BAGIAN 2: Fungsi Manajemen Peran (PENTING)
-- Fungsi ini sangat krusial untuk keamanan. Fungsinya adalah untuk memeriksa
-- apakah pengguna yang sedang login memiliki peran 'admin'.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT auth.jwt()->'app_metadata'->>'user_role' = 'admin'
$$;


-- BAGIAN 3: Pengaturan Tabel dan Kebijakan Keamanan (RLS)
-- Membuat semua tabel yang dibutuhkan oleh aplikasi dan menerapkan kebijakan
-- keamanan untuk memastikan hanya pengguna yang berwenang yang dapat mengakses data.

-- Tabel Pengumuman
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false NOT NULL
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow only admins to manage" ON announcements FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Tabel Polling
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  question TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON polls FOR SELECT USING (true);
CREATE POLICY "Allow only admins to manage" ON polls FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Tabel Opsi Polling
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  vote_count INT DEFAULT 0 NOT NULL
);
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Allow only admins to manage" ON poll_options FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Tabel Berkas
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_type TEXT NOT NULL
);
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON files FOR SELECT USING (true);
CREATE POLICY "Allow only admins to manage" ON files FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Tabel Suara (untuk mencegah vote ganda)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, poll_id) -- Memastikan pengguna hanya bisa vote sekali per polling
);
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to insert their own vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to see their own votes" ON votes FOR SELECT USING (auth.uid() = user_id);


-- BAGIAN 4: Logika Voting (Fungsi Database)
-- Menangani proses voting secara aman di sisi server, memastikan satu pengguna
-- hanya bisa memilih satu kali per polling dan polling tersebut aktif.
CREATE OR REPLACE FUNCTION handle_vote(option_id_to_vote UUID)
RETURNS TEXT AS $$
DECLARE
    poll_id_to_vote UUID;
    poll_is_active BOOLEAN;
BEGIN
    -- Temukan poll_id dan periksa apakah aktif
    SELECT poll_id, p.is_active INTO poll_id_to_vote, poll_is_active
    FROM poll_options po JOIN polls p ON po.poll_id = p.id
    WHERE po.id = option_id_to_vote;

    IF NOT poll_is_active THEN
        RETURN 'Error: Voting for this poll is closed.';
    END IF;

    -- Masukkan catatan ke tabel votes.
    -- Kendala UNIQUE pada (user_id, poll_id) akan error jika sudah vote.
    INSERT INTO votes (user_id, poll_option_id, poll_id)
    VALUES (auth.uid(), option_id_to_vote, poll_id_to_vote);

    -- Tambah vote_count di tabel poll_options
    UPDATE poll_options
    SET vote_count = vote_count + 1
    WHERE id = option_id_to_vote;
    
    RETURN 'Success: Vote cast.';
EXCEPTION
    WHEN unique_violation THEN
        RETURN 'Error: You have already voted in this poll.';
END;
$$ LANGUAGE plpgsql;


-- BAGIAN 5: Pengaturan Penyimpanan (Storage)
-- CATATAN: Pastikan Anda sudah membuat bucket bernama 'mplb_files' di menu Storage
-- pada dasbor Supabase Anda SEBELUM menjalankan kebijakan ini.

-- Izinkan akses baca publik untuk file
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'mplb_files');
-- Izinkan admin untuk mengunggah, memperbarui, dan menghapus
CREATE POLICY "Allow admins to upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mplb_files' AND is_admin());
CREATE POLICY "Allow admins to update" ON storage.objects FOR UPDATE USING (bucket_id = 'mplb_files' AND is_admin());
CREATE POLICY "Allow admins to delete" ON storage.objects FOR DELETE USING (bucket_id = 'mplb_files' AND is_admin());


-- BAGIAN 7: Fungsi Manajemen Pengguna
-- Memungkinkan admin untuk mengelola pengguna (melihat, mengubah peran, menghapus)
-- langsung dari antarmuka aplikasi.

-- Fungsi untuk admin mendapatkan detail semua pengguna
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    user_role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can view all users.';
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.raw_app_meta_data->>'full_name' AS full_name,
        u.raw_app_meta_data->>'user_role' AS user_role,
        u.created_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- Fungsi untuk admin mengubah peran pengguna
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can change user roles.';
    END IF;

    IF new_role <> 'admin' AND new_role <> 'student' THEN
        RAISE EXCEPTION 'Invalid role specified. Must be "admin" or "student".';
    END IF;

    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('user_role', new_role)
    WHERE id = target_user_id;

    RETURN 'User role updated successfully.';
END;
$$;

-- Fungsi untuk admin menghapus pengguna
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can delete users.';
    END IF;
    
    PERFORM auth.admin_delete_user(target_user_id);

    RETURN 'User deleted successfully.';
END;
$$;


-- BAGIAN 8: Fungsi Statistik Dasbor
-- Menyediakan statistik untuk dasbor admin secara aman.
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_users_count INT;
    active_polls_count INT;
    total_files_count INT;
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can view dashboard stats.';
    END IF;

    SELECT count(*) INTO total_users_count FROM auth.users;
    SELECT count(*) INTO active_polls_count FROM public.polls WHERE is_active = true;
    SELECT count(*) INTO total_files_count FROM public.files;

    RETURN json_build_object(
        'total_users', total_users_count,
        'active_polls', active_polls_count,
        'total_files', total_files_count
    );
END;
$$;

-- =============================================================================
-- END OF SQL SCRIPT
-- =============================================================================


================================================================================
LANGKAH MANUAL SETELAH MENJALANKAN SKRIP SQL
================================================================================

1.  **Pengaturan Penyimpanan (Storage):**
    - Pergi ke "Storage" di dasbor Supabase Anda.
    - Buat bucket baru dengan nama `mplb_files`.
    - (Kebijakan untuk bucket ini sudah diatur dalam skrip di atas).

2.  **Pengaturan Akun Admin:**
    - Pergi ke Authentication -> Providers dan aktifkan provider "Email".
    - Daftar pengguna baru melalui aplikasi Anda dengan email `admin.mplbhub@smklppmri2.sch.id` dan password `password-mplb-aman`.
    - Setelah pengguna terdaftar, pergi ke Authentication -> Users. Temukan pengguna admin tersebut.
    - Klik pada pengguna, lalu di bagian **User Management**, klik **Edit User**.
    - Di bagian **User App Metadata**, masukkan JSON berikut: `{"user_role": "admin"}`.
    - Klik **Save**. Langkah ini sangat penting agar kontrol akses berbasis peran berfungsi.

================================================================================
*/
