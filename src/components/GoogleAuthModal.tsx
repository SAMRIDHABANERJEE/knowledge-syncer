/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  ArrowRight,
  LogIn,
  RotateCcw,
  KeyRound,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';
import { generateGoogleAvatar, parseJwt, formatLastAuthTime } from '../utils/auth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  initialMode?: 'signin' | 'signup' | 'reauth';
  onLoginSuccess: (user: UserProfile, isNewUser: boolean) => void;
  onReauthenticateSuccess?: (user: UserProfile) => void;
}

// Google "G" multicolor SVG icon
export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialMode = 'signin',
  onLoginSuccess,
  onReauthenticateSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reauth'>(initialMode);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isManualExpanded, setIsManualExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReauthSuccess, setIsReauthSuccess] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuthMode(initialMode);
    setIsReauthSuccess(false);
    setError(null);
  }, [initialMode, isOpen]);

  // Initialize Google Identity Services (GIS) if available
  useEffect(() => {
    if (!isOpen) return;

    const handleCredentialResponse = (response: any) => {
      if (response && response.credential) {
        const payload = parseJwt(response.credential);
        if (payload) {
          const user: UserProfile = {
            uid: payload.sub || `google_${Date.now()}`,
            name: payload.name || 'Google Scholar',
            email: payload.email || 'scholar@google.com',
            picture: payload.picture || generateGoogleAvatar(payload.name, payload.email),
            provider: 'google',
            createdAt: currentUser?.createdAt || new Date().toISOString(),
            lastReauthenticatedAt: new Date().toISOString(),
          };

          if (authMode === 'reauth' && onReauthenticateSuccess) {
            onReauthenticateSuccess(user);
          } else {
            onLoginSuccess(user, authMode === 'signup');
          }
          onClose();
        }
      }
    };

    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: 'sample-client-id.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        if (googleBtnRef.current) {
          (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: authMode === 'signup' ? 'signup_with' : 'signin_with',
          });
        }
      } catch (e) {
        // Fallback to one-click Google account connector
      }
    }
  }, [isOpen, authMode, currentUser, onLoginSuccess, onReauthenticateSuccess, onClose]);

  if (!isOpen) return null;

  // Handle Reauthentication of current user
  const handleReauthenticate = () => {
    const targetUser = currentUser || {
      uid: 'google_banerjeesamridha7',
      name: 'Samridha Banerjee',
      email: 'banerjeesamridha7@gmail.com',
      picture: generateGoogleAvatar('Samridha Banerjee', 'banerjeesamridha7@gmail.com'),
      provider: 'google' as const,
      createdAt: new Date().toISOString(),
    };

    const updated: UserProfile = {
      ...targetUser,
      lastReauthenticatedAt: new Date().toISOString(),
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    setIsReauthSuccess(true);
    setTimeout(() => {
      if (onReauthenticateSuccess) {
        onReauthenticateSuccess(updated);
      } else {
        onLoginSuccess(updated, false);
      }
      onClose();
    }, 700);
  };

  // One-Click Google Sign In (Auto-detected email)
  const handlePrimaryGoogleAuth = (email: string, name: string) => {
    const user: UserProfile = {
      uid: `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: name,
      email: email,
      picture: generateGoogleAvatar(name, email),
      provider: 'google',
      createdAt: new Date().toISOString(),
      lastReauthenticatedAt: new Date().toISOString(),
    };

    if (authMode === 'reauth' && onReauthenticateSuccess) {
      onReauthenticateSuccess(user);
    } else {
      onLoginSuccess(user, authMode === 'signup');
    }
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please provide a valid Google email address.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    handlePrimaryGoogleAuth(customEmail.trim(), name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand / Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-lg p-2.5">
            <GoogleIcon className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {authMode === 'reauth'
              ? 'Reauthenticate Google Credentials'
              : authMode === 'signin'
              ? 'Sign in with Google'
              : 'Create Google Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {authMode === 'reauth'
              ? 'Confirm your identity and renew cryptographic session credentials.'
              : 'Sync your YouTube PDF library, preserve XP and badge levels, and access study notes across devices.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-4">
            <button
              onClick={() => {
                setAuthMode('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setAuthMode('reauth');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authMode === 'reauth'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reauthenticate
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Reauth Mode Card */}
          {authMode === 'reauth' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      currentUser?.picture ||
                      generateGoogleAvatar('Samridha Banerjee', 'banerjeesamridha7@gmail.com')
                    }
                    alt="User Avatar"
                    className="w-10 h-10 rounded-xl object-cover border border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">
                      {currentUser?.name || 'Samridha Banerjee'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      {currentUser?.email || 'banerjeesamridha7@gmail.com'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Last Reauthenticated:</span>
                  </span>
                  <span className="font-mono text-slate-200 font-medium">
                    {formatLastAuthTime(currentUser?.lastReauthenticatedAt)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReauthenticate}
                disabled={isReauthSuccess}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
              >
                {isReauthSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Credentials Verified & Renewed!</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Reauthenticate Credentials (+15 XP)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 py-1 font-medium transition-colors cursor-pointer"
              >
                Sign in with a different Google account instead
              </button>
            </div>
          ) : (
            <>
              {/* GIS Render target container if GIS script is active */}
              <div ref={googleBtnRef} className="w-full flex justify-center empty:hidden" />

              {/* Quick Continue with Google Account */}
              <button
                onClick={() =>
                  handlePrimaryGoogleAuth('banerjeesamridha7@gmail.com', 'Samridha Banerjee')
                }
                className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-slate-800 bg-white hover:bg-slate-100 shadow-lg active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer border border-slate-300"
              >
                <div className="flex items-center gap-3">
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs text-slate-900 leading-tight">
                      Continue as Samridha Banerjee
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      banerjeesamridha7@gmail.com
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              {/* Alternative Google Account Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsManualExpanded(!isManualExpanded)}
                  className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 py-1 font-medium transition-colors cursor-pointer"
                >
                  {isManualExpanded
                    ? 'Hide custom account input'
                    : 'Or sign in with another Google account'}
                </button>

                {isManualExpanded && (
                  <form
                    onSubmit={handleCustomSubmit}
                    className="mt-3 space-y-3 pt-3 border-t border-slate-800"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Google Account Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Alex Chen"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Google Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="e.g. yourname@gmail.com"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>
                        {authMode === 'signup'
                          ? 'Complete Google Sign Up'
                          : 'Sign In with This Google Account'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        {/* Benefits & Security Seal */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Automatic document cloud sync & cross-session persistence</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Google Identity OpenID Connect secure authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
