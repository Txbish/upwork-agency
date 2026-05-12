'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskKanbanCardProps {
  task: Task;
  index: number;
  showProject?: boolean;
}

export default function TaskKanbanCard({ task, showProject }: TaskKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  // dnd-kit owns the drag/reorder motion — DO NOT add framer-motion on top, it fights the transform.
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const isUrgent = task.priority === 0;
  const isHighPriority = task.priority >= 7 && task.priority < 11;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing rounded-2xl border bg-parchment p-3.5 space-y-2',
        'transition-colors duration-150 ease-out hover:bg-cream hover:border-ink/35 touch-none',
        isUrgent
          ? 'border-[hsl(var(--destructive))]/55'
          : isHighPriority
            ? 'border-ink/35'
            : 'border-mist',
      )}
    >
      {showProject && task.project && (
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-storm/55">
          {(task.project as { title?: string }).title}
        </p>
      )}

      <div className="flex items-start gap-2">
        {isUrgent && (
          <span className="relative mt-1 flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--destructive))]/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14px] font-medium leading-[1.25] tracking-[-0.006em] text-ink">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 truncate text-[12px] text-storm/65">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-storm/65 tracking-[-0.006em]">
        {task.assignee && (
          <span className="flex min-w-0 items-center gap-1 truncate">
            <User className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {[task.assignee.firstName, task.assignee.lastName].filter(Boolean).join(' ') ||
                task.assignee.email}
            </span>
          </span>
        )}

        <div className="flex-1" />

        {task.priority >= 0 && (
          <Badge
            variant={isUrgent ? 'destructive' : isHighPriority ? 'solid' : 'default'}
            className="px-2 py-0 text-[11px] tnum"
          >
            {isUrgent ? 'P0' : `P${task.priority}`}
          </Badge>
        )}

        {task.estimatedHours != null && (
          <span className="flex items-center gap-1 shrink-0 tnum">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            {task.estimatedHours}h
          </span>
        )}
      </div>
    </div>
  );
}
