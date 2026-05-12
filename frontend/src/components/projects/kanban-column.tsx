'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';
import { ProjectCard } from './project-card';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  projects: Project[];
  color?: string;
  onCardClick: (project: Project) => void;
  index?: number;
  /** Renders a thin vertical divider on the LEFT edge. Set false on the first column. */
  showDivider?: boolean;
}

export function KanbanColumn({
  id,
  title,
  count,
  projects,
  onCardClick,
  index = 0,
  showDivider = true,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'column', id },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative flex h-full min-w-[300px] max-w-[340px] flex-1 flex-col pl-6 pr-3',
        showDivider && 'border-l border-mist',
      )}
    >
      {/* Lane header */}
      <div className="flex shrink-0 items-baseline justify-between pb-4 pt-1">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-storm/65">
          {title}
        </h3>
        <span className="text-[16px] font-medium leading-none text-ink tnum">{count}</span>
      </div>

      {/* Drop zone — no surface, just a tinted hover state */}
      <div
        ref={setNodeRef}
        className={cn(
          '-mx-2 flex-1 overflow-y-auto overflow-x-hidden rounded-lg px-2 pt-1 pb-4 transition-colors duration-200',
          isOver && 'bg-blue/[0.06]',
        )}
      >
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {projects.map((project, cardIndex) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => onCardClick(project)}
                index={cardIndex}
              />
            ))}
            {projects.length === 0 && (
              <div className="mt-2 rounded-2xl border border-dashed border-mist/80 px-3 py-8 text-center text-[12px] text-storm/45">
                Empty
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </motion.div>
  );
}
