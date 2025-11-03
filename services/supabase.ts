import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://fynyxwelqaekvebchlrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bnl4d2VscWFla3ZlYmNobHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzk1MzksImV4cCI6MjA3NzYxNTUzOX0.C91U3rAeflfxHKxoU2wfBExVcj3YSxABioOMmdQoE0I';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/*
NOTE FOR THE USER:
For this application with Admin and Student roles to work, you need to set up your Supabase project.

1.  **Enable UUID Generation:**
    Run this in your SQL Editor if you haven't already.
    ```sql
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ```

2.  **Role Management Functions:**
    These helper functions are crucial for our security policies. They check a user's role from their authentication token (JWT).
    
    ```sql
    -- Helper function to get a custom claim from the JWT.
    CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
    RETURNS JSONB AS $$
    BEGIN
        RETURN nullif(current_setting('request.jwt.claims', true), '')::jsonb -> claim;
    END;
    $$ LANGUAGE plpgsql STABLE;

    -- Function to check if the current user has the 'admin' role.
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN get_my_claim('user_role') = '"admin"';
    END;
    $$ LANGUAGE plpgsql STABLE;
    ```

3.  **Tables and Policies Setup:**
    Run the following SQL to create and secure all necessary tables.

    ```sql
    -- Announcements Table
    CREATE TABLE announcements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT false NOT NULL -- NEW: For pinning announcements
    );
    ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read access" ON announcements FOR SELECT USING (true);
    CREATE POLICY "Allow only admins to manage" ON announcements FOR ALL USING (is_admin()) WITH CHECK (is_admin());

    -- Polls Table
    CREATE TABLE polls (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      question TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL
    );
    ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read access" ON polls FOR SELECT USING (true);
    CREATE POLICY "Allow only admins to manage" ON polls FOR ALL USING (is_admin()) WITH CHECK (is_admin());

    -- Poll Options Table
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

    -- Files Table
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

    -- Votes Table (to prevent multiple votes)
    CREATE TABLE votes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
      poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
      UNIQUE(user_id, poll_id) -- Ensures a user can only vote once per poll
    );
    ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow users to insert their own vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Allow users to see their own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
    ```

4.  **Voting Logic (Stored Procedure):**
    This function handles voting securely and prevents race conditions.
    ```sql
    CREATE OR REPLACE FUNCTION handle_vote(option_id_to_vote UUID)
    RETURNS TEXT AS $$
    DECLARE
        poll_id_to_vote UUID;
        poll_is_active BOOLEAN;
    BEGIN
        -- Find the poll_id and check if it's active
        SELECT poll_id, p.is_active INTO poll_id_to_vote, poll_is_active
        FROM poll_options po JOIN polls p ON po.poll_id = p.id
        WHERE po.id = option_id_to_vote;

        IF NOT poll_is_active THEN
            RETURN 'Error: Voting for this poll is closed.';
        END IF;

        -- Insert a record into the votes table.
        -- The UNIQUE constraint on (user_id, poll_id) will throw an error if the user has already voted.
        INSERT INTO votes (user_id, poll_option_id, poll_id)
        VALUES (auth.uid(), option_id_to_vote, poll_id_to_vote);

        -- Increment the vote_count on the poll_options table
        UPDATE poll_options
        SET vote_count = vote_count + 1
        WHERE id = option_id_to_vote;
        
        RETURN 'Success: Vote cast.';
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: You have already voted in this poll.';
    END;
    $$ LANGUAGE plpgsql;
    ```

5.  **Storage Setup:**
    - Go to "Storage" in Supabase and create a bucket named `mplb_files`.
    - Set up policies for the bucket:
    ```sql
    -- Allow public read access to files
    CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'mplb_files');
    -- Allow admins to upload, update, and delete
    CREATE POLICY "Allow admins to upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mplb_files' AND is_admin());
    CREATE POLICY "Allow admins to update" ON storage.objects FOR UPDATE USING (bucket_id = 'mplb_files' AND is_admin());
    CREATE POLICY "Allow admins to delete" ON storage.objects FOR DELETE USING (bucket_id = 'mplb_files' AND is_admin());
    ```

6.  **Authentication:**
    - Go to Authentication -> Providers and enable the "Email" provider.
    - Students will sign up through the app.
    - **PENTING: Pengaturan Akun Admin:**
      - Untuk membuat **Admin**, Anda HARUS membuat pengguna khusus untuk sistem login kode tunggal.
      - Daftar pengguna baru dengan email `admin.mplbhub@smklppmri2.sch.id` dan password `password-mplb-aman`. Anda dapat mengubah password ini, tetapi pastikan untuk memperbaruinya juga di file `pages/auth/AdminLoginPage.tsx`.
      - Setelah membuat pengguna, buka tabel `auth.users`, temukan pengguna tersebut, dan edit `raw_app_meta_data` mereka menjadi: `{"user_role": "admin"}`. Langkah ini sangat penting agar kontrol akses berbasis peran berfungsi.

7. **User Management Functions:**
   Run these functions in the SQL Editor to allow admins to manage users from the app UI.
   ```sql
    -- Function for admins to get all users' details
    CREATE OR REPLACE FUNCTION get_all_users()
    RETURNS TABLE (
        id UUID,
        email TEXT,
        full_name TEXT,
        user_role TEXT,
        created_at TIMESTAMPTZ
    )
    LANGUAGE plpgsql
    SECURITY DEFINER -- IMPORTANT: Runs with elevated privileges
    SET search_path = public
    AS $$
    BEGIN
        -- Only allow execution if the caller is an admin
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

    -- Function for admins to update a user's role
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

    -- Function for admins to delete a user
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
        
        -- Use Supabase's built-in admin function to safely delete the user
        PERFORM auth.admin_delete_user(target_user_id);

        RETURN 'User deleted successfully.';
    END;
    $$;
   ```
   
8.  **Dashboard Statistics Function (NEW):**
    This function securely provides statistics for the admin dashboard.
    ```sql
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
    ```
*/