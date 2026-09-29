import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, KeyRound, Info } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, getAdminCredentials } = useAuth();
  const adminCreds = getAdminCredentials();

  const [username, setUsername] = useState(adminCreds.username || 'admin');
  const [password, setPassword] = useState(adminCreds.password || 'admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if admin credentials update
  useEffect(() => {
    const creds = getAdminCredentials();
    setUsername(creds.username || 'admin');
    setPassword(creds.password || 'admin123');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await login(username, password);
    if (!result.success) {
      setError(result.message || 'Invalid username or password.');
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    await login(u, p);
  };

  const currentAdmin = getAdminCredentials();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        {/* App Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30 text-white mb-4">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Panchayat Connect
          </h1>
          <p className="text-xs font-semibold text-blue-700 mt-1 uppercase tracking-wider">
            Community Information & Field Work Management System
          </p>
          <p className="text-xs text-gray-500 mt-1.5">
            Secure administrative access for social work and field operations
          </p>
        </div>

        {/* Current Admin Notice */}
        <div className="mb-5 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-blue-900">
          <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold flex items-center space-x-1.5">
              <span>Admin Account:</span>
              <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">
                @{currentAdmin.username}
              </span>
            </div>
            <p className="text-[11px] text-blue-700">
              You can change admin username and password anytime in <strong>Settings → Admin Credentials</strong>.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin / Staff Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-colors cursor-pointer mt-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Sign-ins */}
        <div className="mt-7 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2.5">
            Quick Auto-Fill Demo Roles
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin(currentAdmin.username, currentAdmin.password || 'admin123')}
              className="p-2.5 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 rounded-xl text-left font-medium transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 block text-xs">Admin</span>
                <span className="text-[9px] bg-blue-200/80 text-blue-900 px-1 py-0.2 rounded font-mono">
                  @{currentAdmin.username}
                </span>
              </div>
              <span className="text-[10px] text-blue-700">Full field & delete access</span>
            </button>
            <button
              onClick={() => handleQuickLogin('superadmin', 'super123')}
              className="p-2.5 bg-gray-50 hover:bg-purple-50 hover:border-purple-300 border border-gray-200 rounded-xl text-left font-medium transition-colors cursor-pointer"
            >
              <span className="font-bold text-gray-900 block text-xs">Super Admin</span>
              <span className="text-[10px] text-gray-500">Full system control</span>
            </button>
            <button
              onClick={() => handleQuickLogin('fieldworker1', 'field123')}
              className="p-2.5 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 rounded-xl text-left font-medium transition-colors cursor-pointer"
            >
              <span className="font-bold text-gray-900 block text-xs">Field User</span>
              <span className="text-[10px] text-gray-500">Citizen data entry</span>
            </button>
            <button
              onClick={() => handleQuickLogin('viewer', 'viewer123')}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl text-left font-medium transition-colors cursor-pointer"
            >
              <span className="font-bold text-gray-900 block text-xs">Viewer</span>
              <span className="text-[10px] text-gray-500">Read-only reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
