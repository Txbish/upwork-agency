'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Logo } from '@/components/brand/logo';

interface InviteDetails {
  email: string;
  organization: { name: string };
  role: { name: string };
  team?: { name: string } | null;
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const { data } = await api.get(`/users/invites/${token}`);
        setInvite(data);
      } catch {
        toast.error('Invite is invalid or expired');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/users/invites/${token}/accept`, {
        firstName,
        lastName,
        password,
      });
      toast.success('Account created. Please log in.');
      router.push('/login');
    } catch {
      toast.error('Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2">
          <Logo size={72} />
          <span className="text-[28px] font-medium tracking-[-0.02em] leading-none text-ink">
            aop.
          </span>
        </div>

        {loading ? (
          <Frame title="Loading invite…">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </Frame>
        ) : !token || !invite ? (
          <Frame title="Invite unavailable">
            <p className="text-[14px] leading-[1.5] text-storm/75">
              This invite link is invalid or has expired.
            </p>
            <Button onClick={() => router.push('/login')}>Back to login</Button>
          </Frame>
        ) : (
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
              accept invite
            </p>
            <h2 className="mt-2 text-[36px] font-medium leading-[1] tracking-[-0.02em] text-ink">
              join the team.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.5] text-storm/75">
              {invite.organization.name} ·{' '}
              <span className="capitalize text-ink">{invite.role.name.replace(/_/g, ' ')}</span>
              {invite.team?.name ? <> · {invite.team.name}</> : null}
            </p>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" value={invite.email} disabled />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="invite-first-name">First name</Label>
                  <Input
                    id="invite-first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-last-name">Last name</Label>
                  <Input
                    id="invite-last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-password">Password</Label>
                <Input
                  id="invite-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-confirm-password">Confirm password</Label>
                <Input
                  id="invite-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-mist bg-parchment p-8 space-y-4">
      <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.012em] text-ink">
        {title}
      </h2>
      {children}
    </div>
  );
}
