'use client';

import { useState, type FormEvent } from 'react';
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Invalid credentials. Please try again.');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting || authLoading;

  return (
    <div className="flex min-h-screen w-full bg-cream">
      {/* Left: ink blueprint panel */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
        {/* Decorative orange wash band */}
        <div className="pointer-events-none absolute -top-40 -right-24 h-[420px] w-[420px] rounded-[48px] bg-orange opacity-90" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-[340px] w-[340px] rounded-full border border-cream/15" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-[180px] w-[180px] rounded-full border border-cream/10" />
        <div className="pointer-events-none absolute bottom-32 right-32 h-[100px] w-[100px] rounded-full border border-cream/20" />

        <div className="relative z-10 flex items-center gap-2 text-cream">
          <Logo size={88} invert />
          <span className="text-[32px] font-medium tracking-[-0.02em] leading-none">aop.</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-cream/55 mb-6">
            agency operations platform · v1
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[64px] font-medium leading-[0.95] tracking-[-0.025em] text-cream"
          >
            an engineering-driven<br />
            operations layer for the<br />
            <span className="text-orange">freelance agency.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-md text-[18px] leading-[1.4] tracking-[-0.006em] text-cream/70"
          >
            One canvas for the entire pipeline. Bid, interview, deal, deliver, qa. No bloat, no
            color-coded chaos.
          </motion.p>
        </div>

        <p className="relative z-10 text-[12px] tracking-[0.08em] text-cream/45">
          © {new Date().getFullYear()} · agency operations platform
        </p>
      </div>

      {/* Right: form */}
      <div className="relative flex flex-1 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <Logo size={72} />
            <span className="text-[28px] font-medium tracking-[-0.02em] leading-none text-ink">
              aop.
            </span>
          </div>

          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
            sign in
          </p>
          <h2 className="mt-2 text-[36px] font-medium leading-[1] tracking-[-0.02em] text-ink">
            welcome back.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.5] text-storm/70">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/10 px-4 py-3"
              >
                <p className="text-[13px] font-medium text-[hsl(var(--destructive))]">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agency.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="group w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-10 text-[13px] text-storm/55">
            Need access? Ask your admin to send an invite.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
