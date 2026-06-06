-- ============================================================================
-- ORION-9 — Migration 003: Admin Setup and Security Enhancements
-- Run this after schema.sql to set up the SUPER_OMEGA admin account
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create the SUPER_OMEGA admin account setup function
-- This function will be called on first login to auto-upgrade the admin
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_and_upgrade_super_omega()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_email CONSTANT TEXT := 'mbm143105@gmail.com';
  v_user_id UUID;
BEGIN
  -- Find the user with the admin email
  SELECT id INTO v_user_id FROM public.profiles WHERE email = v_admin_email;
  
  -- If user exists, upgrade to OMEGA clearance
  IF v_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET clearance_level = 'OMEGA' 
    WHERE id = v_user_id 
    AND clearance_level != 'OMEGA';
    
    -- Log the upgrade
    INSERT INTO public.admin_actions (admin_id, action, target_type, target_id, metadata)
    VALUES (
      v_user_id,
      'system.super_omega_upgrade',
      'profile',
      v_user_id,
      '{"reason": "Auto-upgrade for SUPER_OMEGA account", "email": "' || v_admin_email || '"}'::jsonb
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Add indexes for performance
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS profiles_clearance_idx ON public.profiles(clearance_level);
CREATE INDEX IF NOT EXISTS teams_status_idx ON public.teams(status);
CREATE INDEX IF NOT EXISTS endgame_options_correct_idx ON public.endgame_options(is_correct);

-- ----------------------------------------------------------------------------
-- 3. Ensure game_config singleton constraint
-- ----------------------------------------------------------------------------

-- Add a check constraint to ensure only one row exists in game_config
-- This is enforced by using a fixed UUID and application logic
-- But we add a trigger to prevent manual insertion of additional rows

CREATE OR REPLACE FUNCTION public.enforce_game_config_singleton()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if a row already exists
  IF EXISTS (SELECT 1 FROM public.game_config WHERE id != NEW.id) THEN
    RAISE EXCEPTION 'game_config table can only contain one row with id 00000000-0000-0000-0000-000000000001';
  END IF;
  
  -- Ensure the ID is always the fixed UUID
  IF NEW.id != '00000000-0000-0000-0000-000000000001'::uuid THEN
    RAISE EXCEPTION 'game_config ID must be 00000000-0000-0000-0000-000000000001';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS game_config_singleton_check ON public.game_config;
CREATE CONSTRAINT TRIGGER game_config_singleton_check
AFTER INSERT OR UPDATE ON public.game_config
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION public.enforce_game_config_singleton();

-- ----------------------------------------------------------------------------
-- 4. Add RLS policy for endgame_options
-- ----------------------------------------------------------------------------

ALTER TABLE public.endgame_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "endgame_options_read" ON public.endgame_options;
DROP POLICY IF EXISTS "endgame_options_omega" ON public.endgame_options;

CREATE POLICY "endgame_options_read" ON public.endgame_options 
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "endgame_options_omega" ON public.endgame_options 
FOR ALL USING (public.is_omega()) WITH CHECK (public.is_omega());

-- ----------------------------------------------------------------------------
-- 5. Auto-execute super omega upgrade on profile updates
-- ----------------------------------------------------------------------------

-- Create a trigger that checks for super omega upgrade when profiles are updated
CREATE OR REPLACE FUNCTION public.trigger_check_super_omega()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.check_and_upgrade_super_omega();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_super_omega_on_profile ON public.profiles;
CREATE TRIGGER check_super_omega_on_profile
AFTER INSERT OR UPDATE OF email ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION public.trigger_check_super_omega();

-- ----------------------------------------------------------------------------
-- 6. Initial execution for existing users
-- ----------------------------------------------------------------------------

-- Run the upgrade check immediately for any existing admin user
SELECT public.check_and_upgrade_super_omega();

-- ============================================================================
-- End of Migration 003
-- ============================================================================
