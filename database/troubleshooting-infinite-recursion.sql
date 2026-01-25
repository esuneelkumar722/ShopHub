-- TROUBLESHOOTING: Fix infinite recursion error in admin policies

DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

CREATE POLICY "Users can read own role" ON user_roles 
FOR SELECT USING (auth.uid() = user_id);
