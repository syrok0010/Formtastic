"use client";

import * as React from "react";
import { useState, useRef, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ExpandableButtonProps {
  buttonText: string;
  placeholderText: string;
  onSubmitAction: (value: string) => Promise<void | { error?: string }>;
  icon?: React.ReactNode;
}

export const ExpandableButton = ({
  buttonText,
  placeholderText,
  onSubmitAction,
  icon = <Plus className="mr-2 h-4 w-4" />,
}: ExpandableButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) inputRef.current.focus();
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (!inputValue.trim() || isPending) return;

    startTransition(async () => {
      const result = await onSubmitAction(inputValue);

      if (result?.error) {
        alert(result.error);
      } else {
        setInputValue("");
        setIsExpanded(false);
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSubmit();
    if (event.key === "Escape") {
      setIsExpanded(false);
      setInputValue("");
    }
  };

  const containerVariants = {
    collapsed: { width: "192px" },
    expanded: { width: "320px" },
  };
  const buttonTextVariants = {
    collapsed: { opacity: 1, y: 0 },
    expanded: { opacity: 0, y: -20 },
  };
  const inputVariants = {
    collapsed: { opacity: 0, scale: 0.95, pointerEvents: "none" as const },
    expanded: { opacity: 1, scale: 1, pointerEvents: "auto" as const },
  };

  return (
    <motion.div
      ref={containerRef}
      layout
      variants={containerVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => !isExpanded && setIsExpanded(true)}
      className={cn(
        "relative flex items-center justify-center h-12 rounded-full cursor-pointer",
        isExpanded
          ? "bg-background shadow-lg"
          : "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300",
      )}
    >
      <motion.div
        variants={buttonTextVariants}
        transition={{ duration: 0.2 }}
        className="absolute flex items-center"
      >
        {icon}
        {buttonText}
      </motion.div>

      <motion.div
        variants={inputVariants}
        transition={{ delay: isExpanded ? 0.1 : 0, duration: 0.2 }}
        className="flex w-full items-center px-2"
      >
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder={placeholderText}
          disabled={isPending}
          className="border-none w-full focus-visible:ring-0 focus-visible:ring-offset-0 text-md bg-transparent placeholder:text-muted-foreground"
        />
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit();
          }}
          disabled={!inputValue.trim() || isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
