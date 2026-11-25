"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Check, ListTodo, Play } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { TaskStatus, TaskWithDetails } from "@/types";
import { TaskCard } from "./TaskCard";

type Column = {
  status: TaskStatus;
  label: string;
  icon: React.ReactNode;
  headerBg: string;
  badgeBg: string;
  iconBg: string;
};

const COLUMNS: Column[] = [
  {
    status: "Todo",
    label: "To Do",
    icon: <ListTodo className="w-3.5 h-3.5" />,
    headerBg: "bg-[#EEF4FF]",
    badgeBg: "bg-blue-100 text-[#0066FF]",
    iconBg: "bg-blue-200/70 text-[#0066FF]",
  },
  {
    status: "In Progress",
    label: "In Progress",
    icon: <Play className="w-3.5 h-3.5 fill-current" />,
    headerBg: "bg-[#EEF4FF]",
    badgeBg: "bg-blue-100 text-[#0066FF]",
    iconBg: "bg-[#0066FF] text-white",
  },
  {
    status: "Done",
    label: "Done",
    icon: <Check className="w-3.5 h-3.5" strokeWidth={2.5} />,
    headerBg: "bg-[#ECFDF5]",
    badgeBg: "bg-emerald-100 text-emerald-700",
    iconBg: "bg-emerald-500 text-white",
  },
];

const DROP_TIMING = {
  duration: 260,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
};

const dropAnimation: DropAnimation = {
  ...DROP_TIMING,
  sideEffects: (args) => {
    args.dragOverlay.node.firstElementChild?.animate(
      [{ transform: "none", boxShadow: "0 0 0 0 rgba(15, 23, 42, 0)" }],
      { ...DROP_TIMING, fill: "forwards" }
    );
    return defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0" } },
    })(args);
  },
};

function CardRow({
  isCollapsed = false,
  className = "",
  children,
}: {
  isCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-ui ease-editorial ${
        isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]"
      } ${className}`}
    >
      <div className={`min-h-0 ${isCollapsed ? "overflow-hidden" : ""}`}>
        <div className="pb-3">{children}</div>
      </div>
    </div>
  );
}

function DraggableTask({
  task,
  menuItems,
}: {
  task: TaskWithDetails;
  menuItems: DropdownMenuItem[];
}) {
  const { setNodeRef, listeners, isDragging } = useDraggable({ id: task.id });

  return (
    <CardRow isCollapsed={isDragging}>
      <div ref={setNodeRef} className="relative">
        <div
          {...listeners}
          className="rounded-xl bg-white border border-slate-200/70 hover:border-blue-200 transition-colors cursor-grab select-none touch-manipulation [-webkit-touch-callout:none]"
        >
          <TaskCard task={task} />
        </div>
        <div className="absolute right-1 top-1 sm:right-2.5 sm:top-2.5">
          <DropdownMenu items={menuItems} aria-label={`Aksi tugas ${task.title}`} />
        </div>
      </div>
    </CardRow>
  );
}

function DropSlot({ task }: { task: TaskWithDetails }) {
  return (
    <CardRow className="animate-slot-in">
      <div
        aria-hidden="true"
        className="rounded-xl border border-dashed border-[#0066FF]/50 bg-[#EEF4FF]"
      >
        <div className="invisible">
          <TaskCard task={task} />
        </div>
      </div>
    </CardRow>
  );
}

function BoardColumn({
  column,
  count,
  isDropTarget,
  children,
}: {
  column: Column;
  count: number;
  isDropTarget: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: column.status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3.5 space-y-3 transition-[background-color,border-color,box-shadow] duration-ui min-h-[260px] ${
        isDropTarget
          ? "bg-[#EEF4FF]/60 border-[#0066FF]/50 ring-2 ring-[#0066FF]/20"
          : "bg-white/70 border-slate-200/70"
      }`}
    >
      <div
        className={`flex items-center justify-between px-3.5 py-3 rounded-xl ${column.headerBg}`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center ${column.iconBg}`}
          >
            {column.icon}
          </span>
          <span className="text-sm font-bold text-slate-900">{column.label}</span>
        </div>
        <span
          className={`min-w-[26px] h-6 px-2 rounded-full text-xs font-bold flex items-center justify-center ${column.badgeBg}`}
        >
          {count}
        </span>
      </div>

      <div className="-mb-3">{children}</div>
    </div>
  );
}

type TaskBoardProps = {
  tasks: TaskWithDetails[];
  getMenuItems: (task: TaskWithDetails) => DropdownMenuItem[];
  onStatusChange: (task: TaskWithDetails, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
};

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  getMenuItems,
  onStatusChange,
  onAddTask,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const activeTask = tasks.find((t) => t.id === activeId);
  const targetStatus =
    activeTask && overStatus !== activeTask.status ? overStatus : null;

  const resetDrag = () => {
    setActiveId(null);
    setOverStatus(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragOver={({ over }) =>
        setOverStatus((over?.id as TaskStatus | undefined) ?? null)
      }
      onDragEnd={({ over }) => {
        resetDrag();
        if (activeTask && over) {
          onStatusChange(activeTask, over.id as TaskStatus);
        }
      }}
      onDragCancel={resetDrag}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COLUMNS.map((column) => {
          const isDropTarget = targetStatus === column.status;
          const visibleTasks = tasks.filter(
            (t) =>
              t.status === column.status ||
              (isDropTarget && t.id === activeId)
          );

          return (
            <BoardColumn
              key={column.status}
              column={column}
              count={tasks.filter((t) => t.status === column.status).length}
              isDropTarget={isDropTarget}
            >
              {visibleTasks.length === 0 ? (
                <div className="pb-3">
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-8 px-4 text-center">
                    <p className="text-xs text-slate-400">
                      Belum ada tugas di {column.label}
                    </p>
                    <button
                      type="button"
                      onClick={() => onAddTask(column.status)}
                      className="mt-2 text-xs font-semibold text-[#0066FF] hover:underline"
                    >
                      + Tambah tugas
                    </button>
                  </div>
                </div>
              ) : (
                visibleTasks.map((task) =>
                  task.status === column.status ? (
                    <DraggableTask
                      key={task.id}
                      task={task}
                      menuItems={getMenuItems(task)}
                    />
                  ) : (
                    <DropSlot key={`slot-${task.id}`} task={task} />
                  )
                )
              )}
            </BoardColumn>
          );
        })}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation} zIndex={60}>
          {activeTask && (
            <div className="rounded-xl bg-white border border-[#0066FF] shadow-lift cursor-grabbing select-none animate-card-lift">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
