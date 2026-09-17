
-- Attach the trigger that creates profile + role on new signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing auth users
INSERT INTO public.profiles (user_id, name, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
       u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

-- Backfill student role for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'student'::app_role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'student'
WHERE r.id IS NULL;

-- Promote the earliest user to super_admin if none exists
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::app_role
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin')
ORDER BY u.created_at ASC
LIMIT 1;
