-- 3. MAKE USER ADMIN
-- Replace YOUR_USER_ID with actual user ID from step 1

SELECT id, email FROM auth.users;

INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'admin');

SELECT * FROM user_roles WHERE role = 'admin';
