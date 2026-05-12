'use client';

import Link from 'next/link';
import { useAuthContext } from '@/components/auth-provider';
import { useDashboardAnalytics } from '@/hooks/use-analytics';
import { usePipelineCounts, useProjects } from '@/hooks/use-projects';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProjectStage } from '@/types';
import {
  Calendar,
  Plus,
  ListChecks,
  BarChart3,
  Send,
  ArrowUpRight,
} from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  [ProjectStage.DISCOVERED]: 'Discovered',
  [ProjectStage.SCRIPT_REVIEW]: 'Script Review',
  [ProjectStage.UNDER_REVIEW]: 'Under Review',
  [ProjectStage.ASSIGNED]: 'Assigned',
  [ProjectStage.BID_SUBMITTED]: 'Bid Submitted',
  [ProjectStage.VIEWED]: 'Viewed',
  [ProjectStage.MESSAGED]: 'Messaged',
  [ProjectStage.INTERVIEW]: 'Interview',
  [ProjectStage.WON]: 'Won',
  [ProjectStage.IN_PROGRESS]: 'In Progress',
  [ProjectStage.COMPLETED]: 'Completed',
  [ProjectStage.LOST]: 'Lost',
  [ProjectStage.CANCELLED]: 'Cancelled',
};

const PIPELINE_ORDER: ProjectStage[] = [
  ProjectStage.DISCOVERED,
  ProjectStage.UNDER_REVIEW,
  ProjectStage.ASSIGNED,
  ProjectStage.BID_SUBMITTED,
  ProjectStage.MESSAGED,
  ProjectStage.INTERVIEW,
  ProjectStage.WON,
  ProjectStage.IN_PROGRESS,
  ProjectStage.COMPLETED,
];

function stageVariant(stage: string): 'default' | 'solid' | 'success' | 'destructive' | 'info' | 'warning' {
  if (stage === ProjectStage.WON || stage === ProjectStage.COMPLETED) return 'success';
  if (stage === ProjectStage.LOST || stage === ProjectStage.CANCELLED) return 'destructive';
  if (stage === ProjectStage.IN_PROGRESS) return 'info';
  if (stage === ProjectStage.INTERVIEW || stage === ProjectStage.MESSAGED) return 'warning';
  if (stage === ProjectStage.BID_SUBMITTED) return 'solid';
  return 'default';
}

const STAT_CARDS = [
  { href: '/projects', label: 'Projects', key: 'totalProjects' as const, prefix: '' },
  { href: '/meetings', label: 'Meetings', key: 'totalMeetings' as const, prefix: '' },
  { href: '/projects?stage=WON', label: 'Won', key: 'totalWon' as const, prefix: '' },
  { href: '/analytics', label: 'Revenue', key: 'totalRevenue' as const, prefix: '$' },
];

export default function DashboardPage() {
  const { user, fullUser, activeOrganizationId } = useAuthContext();
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { data: pipelineCounts } = usePipelineCounts(activeOrganizationId ?? undefined);
  const { data: recentProjects } = useProjects({ limit: 6 });

  const displayName = fullUser
    ? [fullUser.firstName, fullUser.lastName].filter(Boolean).join(' ') || fullUser.email
    : (user?.email ?? 'User');

  const firstName = (fullUser?.firstName || displayName.split(' ')[0] || 'there').trim();
  const role = user?.role?.toLowerCase() ?? '';

  const totalPipeline =
    pipelineCounts?.reduce((sum, p) => sum + (p.count ?? 0), 0) ?? 0;
  const countByStage = new Map(pipelineCounts?.map((p) => [p.stage, p.count]) ?? []);

  return (
    <div className="space-y-12">
      {/* ── Hero header ────────────────────────────────────────────── */}
      <header className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
            today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="mt-3 text-[56px] font-medium leading-[0.95] tracking-[-0.025em] text-ink">
            morning, {firstName.toLowerCase()}.
          </h1>
          <p className="mt-4 max-w-xl text-[18px] leading-[1.4] tracking-[-0.006em] text-storm/75">
            Here is the agency at a glance. Pipeline, action items, and the deals moving today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          {(role === 'bidder' || role === 'admin') && (
            <Button asChild>
              <Link href="/projects">
                <Plus className="h-4 w-4 mr-2" strokeWidth={1.75} />
                New Job
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/projects">
              View pipeline
              <ArrowUpRight className="h-4 w-4 ml-2" strokeWidth={1.75} />
            </Link>
          </Button>
        </div>
      </header>

      {/* ── Top stats — flat blueprint row ─────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-mist bg-mist sm:grid-cols-4">
          {STAT_CARDS.map(({ href, label, key, prefix }) => (
            <Link
              key={key}
              href={href}
              className="group bg-cream p-6 transition-colors duration-200 hover:bg-parchment"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-storm/55">
                {label}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                {analyticsLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <span className="text-[40px] font-medium leading-none tracking-[-0.025em] text-ink tnum">
                    {prefix}
                    {analytics?.[key]?.toLocaleString() ?? '0'}
                  </span>
                )}
              </div>
              {key === 'totalWon' && analytics?.conversionRates?.winRate != null && (
                <p className="mt-3 text-[12px] tracking-[-0.006em] text-storm/70">
                  {analytics.conversionRates.winRate}% win rate
                </p>
              )}
              <ArrowUpRight
                className="mt-4 h-4 w-4 text-storm/40 transition-colors group-hover:text-ink"
                strokeWidth={1.75}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Pipeline funnel ─────────────────────────────────────────── */}
      {pipelineCounts && pipelineCounts.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
                pipeline
              </p>
              <h2 className="mt-1 text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-ink">
                {totalPipeline} project{totalPipeline === 1 ? '' : 's'} in motion.
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">
                Open kanban
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-mist bg-mist md:grid-cols-5 lg:grid-cols-9">
            {PIPELINE_ORDER.map((stage) => {
              const count = countByStage.get(stage) ?? 0;
              const isTerminal = stage === ProjectStage.WON || stage === ProjectStage.COMPLETED;
              return (
                <Link
                  key={stage}
                  href={`/projects?stage=${stage}`}
                  className={`group block p-4 transition-colors duration-200 ${
                    isTerminal ? 'bg-ink text-cream hover:bg-storm' : 'bg-cream hover:bg-parchment'
                  }`}
                >
                  <p
                    className={`text-[10px] font-medium uppercase tracking-[0.14em] ${
                      isTerminal ? 'text-cream/55' : 'text-storm/55'
                    }`}
                  >
                    {STAGE_LABELS[stage]}
                  </p>
                  <p
                    className={`mt-3 text-[28px] font-medium leading-none tracking-[-0.02em] tnum ${
                      isTerminal ? 'text-cream' : 'text-ink'
                    }`}
                  >
                    {count}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Recent + quick actions ────────────────────────────────── */}
      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
                recent
              </p>
              <h2 className="mt-1 text-[24px] font-medium leading-[1.1] tracking-[-0.012em] text-ink">
                Latest projects
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">
                All projects
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-card border border-mist bg-parchment">
            {recentProjects?.data?.length ? (
              <ul className="divide-y divide-mist/60">
                {recentProjects.data.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-cream/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-ink tracking-[-0.006em]">
                          {project.title}
                        </p>
                        <p className="mt-1 truncate text-[13px] text-storm/65">
                          {project.organization?.name ?? '---'}
                          {project.niche ? ` · ${project.niche.name}` : ''}
                        </p>
                      </div>
                      <Badge variant={stageVariant(project.stage)}>
                        {STAGE_LABELS[project.stage] ?? project.stage.replace(/_/g, ' ')}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center text-[14px] text-storm/60">
                No recent projects yet.
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
            quick actions
          </p>
          <h2 className="mt-1 text-[24px] font-medium leading-[1.1] tracking-[-0.012em] text-ink">
            Jump in
          </h2>
          <div className="mt-5 flex flex-col gap-2">
            {(role === 'closer' || role === 'admin') && (
              <ActionLink href="/projects?stage=ASSIGNED" icon={Send} label="My assigned bids" />
            )}
            {(role === 'closer' || role === 'admin' || role === 'lead') && (
              <ActionLink href="/meetings" icon={Calendar} label="Upcoming meetings" />
            )}
            {(role === 'operator' || role === 'project_manager' || role === 'admin') && (
              <ActionLink href="/tasks" icon={ListChecks} label="My tasks" />
            )}
            {(role === 'admin' || role === 'lead') && (
              <ActionLink href="/analytics" icon={BarChart3} label="Analytics" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-lg border border-mist bg-cream px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-parchment"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-storm/70 transition-colors group-hover:text-ink" strokeWidth={1.75} />
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4 text-storm/40 transition-colors group-hover:text-ink" strokeWidth={1.75} />
    </Link>
  );
}
