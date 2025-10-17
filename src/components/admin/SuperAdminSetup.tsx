import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function SuperAdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [hasAdmins, setHasAdmins] = useState(false);
  const [supabaseError, setSupabaseError] = useState(false);
  const navigate = useNavigate();

  const checkForAdmins = useCallback(async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        setChecking(false);
        setSupabaseError(true);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1);

      if (error) {
        console.error('Error from Supabase:', error);
      }

      if (data && data.length > 0) {
        setHasAdmins(true);
      }
    } catch (err) {
      console.error('Error checking for admins:', err);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkForAdmins();
  }, [checkForAdmins]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', signUpData.user.id)
          .maybeSingle();

        if (selectError) {
          throw new Error('Error checking profile: ' + selectError.message);
        }

        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: email,
              full_name: fullName,
              is_admin: true,
              admin_role: 'super_admin'
            });

          if (insertError) {
            throw new Error('Database error saving new user: ' + insertError.message);
          }
        } else {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              is_admin: true,
              admin_role: 'super_admin'
            })
            .eq('id', signUpData.user.id);

          if (updateError) {
            throw new Error('Error updating profile: ' + updateError.message);
          }
        }

        alert('Super admin account created successfully! You can now sign in.');
        navigate('/admin/login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create super admin account');
    } finally {
      setLoading(false);
    }
  };

  if (supabaseError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Not Configured</h2>
          <p className="text-gray-600 mb-6">
            Supabase environment variables are not configured. Please check your .env file.
          </p>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (hasAdmins) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete</h2>
          <p className="text-gray-600 mb-6">
            Admin accounts already exist. Please use the login page to access the admin dashboard.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <ShieldCheck className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Create Super Admin Account
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Set up the first administrator account for Wine Nation
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="admin@winenation.ng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Create a strong password"
              />
              <p className="mt-2 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Super Admin'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-center text-gray-500">
              This page is only accessible when no admin accounts exist.
              After creating the first admin, use the regular login page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
