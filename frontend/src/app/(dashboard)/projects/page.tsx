'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/use-projects';
import { useAuthContext } from '@/components/auth-provider';
import { ProjectStage, PricingType, TaskStatus } from '@/types';
import type { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ListTodo,
  Calendar,
  Clock,
  Flag,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getPricingLabel(project: Project): string {
  if (project.contractValue) {
    return formatCurrency(project.contractValue);
  }
  if (project.pricingType === PricingType.FIXED && project.fixedPrice != null) {
    return formatCurrency(project.fixedPrice);
  }
  if (project.pricingType === PricingType.HOURLY) {
    const min = project.hourlyRateMin;
    const max = project.hourlyRateMax;
    if (min != null && max != null) return `$${min}–$${max}/hr`;
    if (min != null) return `$${min}/hr`;
    if (max != null) return `up to $${max}/hr`;
    return 'Hourly';
  }
  return project.pricingType ?? '·';
}

const TASK_STATUS_LABEL: Record<string, string> = {
  [TaskStatus.TODO]: 'todo',
  [TaskStatus.IN_PROGRESS]: 'doing',
  [TaskStatus.IN_REVIEW]: 'review',
  [TaskStatus.DONE]: 'done',
  [TaskStatus.BLOCKED]: 'blocked',
};

const TASK_STATUS_ORDER = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
  TaskStatus.BLOCKED,
];

// ── Main Component ───────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { activeOrganizationId } = useAuthContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useProjects({
    limit: 200,
    organizationId: activeOrganizationId ?? undefined,
  });

  const prefetchProject = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ['projects', id],
        queryFn: () => api.get(`/projects/${id}`).then((r: { data: unknown }) => r.data),
        staleTime: 30_000,
      });
      queryClient.prefetchQuery({
        queryKey: ['tasks', 'by-project', id],
        queryFn: () => api.get(`/tasks/by-project/${id}`).then((r: { data: unknown }) => r.data),
        staleTime: 30_000,
      });
    },
    [queryClient],
  );

  const filteredProjects = useMemo(() => {
    if (!data?.data) return [];

    return data.data.filter((p) => {
      if (p.stage !== ProjectStage.IN_PROGRESS && p.stage !== ProjectStage.COMPLETED) {
        return false;
      }
      if (statusFilter === 'in_progress' && p.stage !== ProjectStage.IN_PROGRESS) return false;
      if (statusFilter === 'completed' && p.stage !== ProjectStage.COMPLETED) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, search, statusFilter]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
            delivery
          </p>
          <h1 className="mt-2 text-[44px] font-medium leading-[1] tracking-[-0.025em] text-ink">
            projects.
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-[1.5] text-storm/75">
            Active and completed delivery projects. Open one to see its tasks, milestones, and
            client conversation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-storm/50"
              strokeWidth={1.75}
            />
            <Input
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-card border border-mist bg-parchment p-6 space-y-3">
              <div className="h-5 w-3/4 rounded bg-ink/10 animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-ink/10 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-ink/10 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-card border border-mist bg-parchment py-20 text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-storm/40" strokeWidth={1.75} />
          <p className="text-[18px] font-medium text-ink">No projects found</p>
          <p className="mt-1 text-[14px] text-storm/65">
            {search ? 'Try adjusting your search or filter.' : 'No delivery-phase projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const isCompleted = project.stage === ProjectStage.COMPLETED;
            const meetingCount = project._count?.meetings ?? 0;
            const milestoneCount = project._count?.milestones ?? 0;
            const statusCounts = project.taskStatusCounts ?? {};
            const urgentCount = project.urgentTaskCount ?? 0;
            const hasAnyTasks = Object.values(statusCounts).some((c) => c && c > 0);

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                onMouseEnter={() => prefetchProject(project.id)}
                className="group relative flex flex-col gap-4 rounded-card border border-mist bg-parchment p-6 transition-colors duration-200 hover:bg-cream"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[17px] font-medium leading-[1.2] tracking-[-0.012em] text-ink">
                    {project.title}
                  </h3>
                  <Badge variant={isCompleted ? 'success' : 'info'}>
                    {isCompleted ? 'Completed' : 'In progress'}
                  </Badge>
                </div>

                {/* Client + price */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] tracking-[-0.006em] text-storm/75">
                  <span className="font-medium text-storm">
                    {project.clientName || 'No client'}
                  </span>
                  <span className="text-storm/40">·</span>
                  <span className="tnum text-ink">{getPricingLabel(project)}</span>
                </div>

                {/* Task strip */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <ListTodo className="h-3.5 w-3.5 text-storm/60" strokeWidth={1.75} />
                  {hasAnyTasks ? (
                    TASK_STATUS_ORDER.map((status) => {
                      const count = statusCounts[status];
                      if (!count || count <= 0) return null;
                      return (
                        <span
                          key={status}
                          className="inline-flex items-center gap-1.5 text-[12px] tracking-[-0.006em] text-storm/75 tnum"
                        >
                          <span className="font-medium text-ink">{count}</span>
                          {TASK_STATUS_LABEL[status]}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[12px] text-storm/55">No tasks</span>
                  )}
                  {urgentCount > 0 && (
                    <Badge variant="warning" className="ml-auto">
                      {urgentCount} urgent
                    </Badge>
                  )}
                </div>

                {/* Meta */}
                <div className="mt-auto flex items-center justify-between gap-3 text-[12px] tracking-[-0.006em] text-storm/65 pt-1 border-t border-mist/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {meetingCount} meeting{meetingCount === 1 ? '' : 's'}
                  </span>
                  {milestoneCount > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Flag className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {milestoneCount}
                    </span>
                  )}
                  {project.endDate ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                      ends {formatDate(project.endDate)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                      ongoing
                    </span>
                  )}
                </div>

                <ArrowUpRight
                  className="absolute right-5 top-5 h-4 w-4 text-storm/40 transition-colors group-hover:text-ink opacity-0 group-hover:opacity-100"
                  strokeWidth={1.75}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
