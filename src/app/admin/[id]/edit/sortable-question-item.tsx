"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableQuestionItemProps {
  id: number | string;
  children: React.ReactNode;
}

export function SortableQuestionItem({
  id,
  children,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 left-[-40px] p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          aria-label="Перетащить вопрос"
        >
          <GripVertical />
        </div>
        {children}
      </div>
    </div>
  );
}
