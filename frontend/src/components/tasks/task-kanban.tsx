'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragCancelEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useUpdateTask } from '@/hooks/use-tasks';
import { TaskStatus } from '@/types';
import type { Task, PaginatedResponse } from '@/types';
import TaskKanbanCard from './task-kanban-card';
import { cn } from '@/lib/utils';

const KANBAN_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: TaskStatus.TODO, title: 'To do' },
  { id: TaskStatus.IN_PROGRESS, title: 'In progress' },
  { id: TaskStatus.IN_REVIEW, title: 'In review' },
  { id: TaskStatus.DONE, title: 'Done' },
  { id: TaskStatus.BLOCKED, title: 'Blocked' },
];

const FINALISED_COLUMN: { id: TaskStatus; title: string } = {
  id: TaskStatus.FINALISED,
  title: 'Finalised',
};

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  tasks: Task[];
  showProject?: boolean;
  showDropPlaceholder?: boolean;
}

function KanbanColumn({
  column,
  tasks,
  showProject,
  showDropPlaceholder,
  showDivider = true,
}: KanbanColumnProps & { showDivider?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      className={cn(
        'flex min-w-[300px] w-[300px] shrink-0 flex-col pl-6 pr-3',
        showDivider && 'border-l border-mist',
      )}
    >
      {/* Lane header */}
      <div className="flex shrink-0 items-baseline justify-between pb-4 pt-1">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-storm/65">
          {column.title}
        </h3>
        <span className="text-[16px] font-medium leading-none text-ink tnum">{tasks.length}</span>
      </div>

      {/* Drop zone — surface-less */}
      <div
        ref={setNodeRef}
        className={cn(
          '-mx-2 flex-1 overflow-y-auto overflow-x-hidden rounded-lg px-2 pt-1 pb-4 max-h-[calc(100vh-19rem)] transition-colors duration-200 ease-out',
          isOver && 'bg-blue/[0.08]',
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.map((task, i) => (
              <TaskKanbanCard key={task.id} task={task} index={i} showProject={showProject} />
            ))}
            {showDropPlaceholder && (
              <div className="h-[112px] rounded-2xl border-2 border-dashed border-blue/45 bg-blue/[0.06]" />
            )}
            {tasks.length === 0 && !showDropPlaceholder && (
              <div className="mt-2 rounded-2xl border border-dashed border-mist/80 px-3 py-8 text-center text-[12px] text-storm/45">
                Empty
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

interface TaskKanbanProps {
  tasks: Task[];
  projectId?: string;
}

export default function TaskKanban({ tasks, projectId }: TaskKanbanProps) {
  const [showFinalised, setShowFinalised] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);
  const updateTask = useUpdateTask();
  const qc = useQueryClient();

  // Synchronously patch every cached "tasks" query so the card lands in the new
  // column on the next render, before the network round-trip. The hook's onMutate
  // also patches, but it awaits cancelQueries first → a 1-2 frame flash where the
  // card snaps back to the old column.
  function applyOptimisticStatus(taskId: string, status: TaskStatus) {
    qc.setQueriesData({ queryKey: ['tasks'] }, (old: unknown) => {
      if (!old) return old;
      if (Array.isArray(old)) {
        return (old as Task[]).map((t) => (t.id === taskId ? { ...t, status } : t));
      }
      if (typeof old === 'object' && 'data' in (old as object)) {
        const paginated = old as PaginatedResponse<Task>;
        if (Array.isArray(paginated.data)) {
          return {
            ...paginated,
            data: paginated.data.map((t) => (t.id === taskId ? { ...t, status } : t)),
          };
        }
      }
      if (typeof old === 'object' && 'id' in (old as object) && (old as Task).id === taskId) {
        return { ...(old as Task), status };
      }
      return old;
    });
  }

  const showProject = !projectId;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const columns = showFinalised ? [...KANBAN_COLUMNS, FINALISED_COLUMN] : KANBAN_COLUMNS;

  const tasksByStatus = columns.reduce(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }

  function resolveColumnId(overId: unknown) {
    if (!overId) return null;
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      return overId as TaskStatus;
    }
    const targetTask = tasks.find((t) => t.id === overId);
    return targetTask?.status ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    const nextColumn = resolveColumnId(event.over?.id);
    setOverColumnId(nextColumn);
  }

  function handleDragCancel(_event: DragCancelEvent) {
    setActiveTask(null);
    setOverColumnId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setOverColumnId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedTask = active.data.current?.task as Task | undefined;
    if (!draggedTask) return;

    const newStatus = resolveColumnId(over.id);
    if (!newStatus || newStatus === draggedTask.status) return;

    // Move the card in the cache immediately; mutate handles persistence + rollback on error.
    applyOptimisticStatus(draggedTask.id, newStatus);
    updateTask.mutate({ id: draggedTask.id, status: newStatus });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-[12px] text-storm/65">
          <Info className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>DONE = dev complete. FINALISED = billed and shared with client.</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFinalised((v) => !v)}
          className="shrink-0 gap-1.5"
        >
          {showFinalised ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />}
          {showFinalised ? 'Hide finalised' : 'Show finalised'}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <motion.div
          className="flex overflow-x-auto pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {columns.map((col, idx) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasksByStatus[col.id] ?? []}
              showProject={showProject}
              showDropPlaceholder={!!activeTask && overColumnId === col.id}
              showDivider={idx > 0}
            />
          ))}
        </motion.div>

        <DragOverlay>
          {activeTask ? <TaskKanbanCard task={activeTask} index={0} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
