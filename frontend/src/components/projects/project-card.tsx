'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Video, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';
import { ProjectStage, ReviewStatus } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index?: number;
}

const SUB_STAGE_LABELS: Partial<Record<ProjectStage, string>> = {
  [ProjectStage.VIEWED]: 'Viewed',
  [ProjectStage.MESSAGED]: 'Messaged',
  [ProjectStage.INTERVIEW]: 'Interview',
};

function getStateBadge(
  project: Project,
): { label: string; variant: 'info' | 'warning' | 'success' | 'destructive' } | null {
  const subLabel = SUB_STAGE_LABELS[project.stage];
  if (subLabel) return { label: subLabel, variant: 'info' };

  let status: string | undefined | null = null;
  if (project.stage === ProjectStage.UNDER_REVIEW) status = project.reviewStatus;
  else if (project.stage === ProjectStage.SCRIPT_REVIEW) status = project.scriptReviewStatus;

  if (!status) return null;
  if (status === ReviewStatus.PENDING) return { label: 'Pending', variant: 'warning' };
  if (status === ReviewStatus.APPROVED) return { label: 'Approved', variant: 'success' };
  if (status === ReviewStatus.REJECTED) return { label: 'Rejected', variant: 'destructive' };
  return null;
}

export function ProjectCard({ project, onClick, index = 0 }: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { type: 'project', project },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const closerName = project.assignedCloser
    ? `${project.assignedCloser.firstName ?? ''} ${project.assignedCloser.lastName ?? ''}`.trim()
    : null;

  const stateBadge = getStateBadge(project);
  const niche = project.niche?.name;
  const videoCount = project._count?.videoProposals ?? 0;
  const hasMeta = !!(niche || project.clientName);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-2xl border border-mist bg-parchment p-4 flex flex-col gap-3',
        'transition-colors duration-200 hover:bg-cream hover:border-ink/35',
        isDragging && 'border-blue bg-cream ring-2 ring-blue/30',
      )}
    >
      {/* Header: title + state badge */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="line-clamp-2 text-[14px] font-medium leading-[1.25] tracking-[-0.006em] text-ink">
          {project.title}
        </h4>
        {stateBadge && (
          <Badge variant={stateBadge.variant} className="shrink-0">
            {stateBadge.label}
          </Badge>
        )}
      </div>

      {/* Meta line: niche · client */}
      {hasMeta && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] tracking-[-0.006em] text-storm/70">
          {niche && <span className="font-medium text-storm">{niche}</span>}
          {niche && project.clientName && <span className="text-storm/40">·</span>}
          {project.clientName && <span className="truncate">{project.clientName}</span>}
        </div>
      )}

      {/* Footer: closer + optional video chip, sep by a thin divider */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-mist/70 pt-3 text-[12px] tracking-[-0.006em]">
        <span className="flex min-w-0 items-center gap-1.5 text-storm/75">
          <User className="h-3 w-3 shrink-0 text-storm/55" strokeWidth={1.75} />
          <span className="truncate">{closerName || 'Unassigned'}</span>
        </span>
        {videoCount > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-storm/60">
            <Video className="h-3 w-3" strokeWidth={1.75} />
            {videoCount}
          </span>
        )}
      </div>
    </motion.div>
  );
}
