import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type AdminRole = 'super_admin' | 'product_manager' | 'order_manager' | 'viewer';

interface AdminRoleData {
  role: AdminRole | null;
  isAdmin: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  loading: boolean;
}

export function useAdminRole(): AdminRoleData {
  const [roleData, setRoleData] = useState<AdminRoleData>({
    role: null,
    isAdmin: false,
    canManageProducts: false,
    canManageOrders: false,
    canManageUsers: false,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const fetchAdminRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setRoleData({
            role: null,
            isAdmin: false,
            canManageProducts: false,
            canManageOrders: false,
            canManageUsers: false,
            loading: false,
          });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, admin_role')
          .eq('id', user.id)
          .maybeSingle();

        if (!mounted) return;

        if (error) throw error;

        const isAdmin = profile?.is_admin || false;
        const role = (profile?.admin_role as AdminRole) || null;

        console.log('Admin role fetched:', { isAdmin, role, profile });

        setRoleData({
          role,
          isAdmin,
          canManageProducts: isAdmin && (role === 'super_admin' || role === 'product_manager'),
          canManageOrders: isAdmin && (role === 'super_admin' || role === 'order_manager'),
          canManageUsers: isAdmin && role === 'super_admin',
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching admin role:', error);
        if (!mounted) return;

        setRoleData({
          role: null,
          isAdmin: false,
          canManageProducts: false,
          canManageOrders: false,
          canManageUsers: false,
          loading: false,
        });
      }
    };

    fetchAdminRole();

    return () => {
      mounted = false;
    };
  }, []);

  return roleData;
}
