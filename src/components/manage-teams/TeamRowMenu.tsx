import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  ExternalLink,
  Edit2,
  Ban,
  RotateCcw,
} from "lucide-react";
import type { Team } from "@/types/team.types";
import { cn } from "@/utils/cn";

export interface TeamRowMenuProps {
  team: Team;
  onViewTeam: (teamId: string) => void;
  onEditTeam: (team: Team) => void;
  onDeactivateTeam: (team: Team) => void;
  onReactivateTeam: (team: Team) => void;
  isSuperAdmin?: boolean;
}

export const TeamRowMenu: React.FC<TeamRowMenuProps> = ({
  team,
  onViewTeam,
  onEditTeam,
  onDeactivateTeam,
  onReactivateTeam,
  isSuperAdmin = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isInactive = team.status === "INACTIVE";

  const menuItems = [
    {
      label: "View Team",
      icon: ExternalLink,
      action: () => onViewTeam(team.id),
      disabled: false,
      tooltip: undefined,
      color: "text-slate-700 hover:bg-slate-50",
    },
    {
      label: "Edit Team",
      icon: Edit2,
      action: () => onEditTeam(team),
      disabled: !isSuperAdmin,
      tooltip: !isSuperAdmin ? "Superadmin privilege required" : undefined,
      color: "text-slate-700 hover:bg-slate-50",
    },
    isInactive
      ? {
          label: "Reactivate Team",
          icon: RotateCcw,
          action: () => onReactivateTeam(team),
          disabled: !isSuperAdmin,
          tooltip: !isSuperAdmin ? "Superadmin privilege required" : undefined,
          color: "text-emerald-700 hover:bg-emerald-50",
        }
      : {
          label: "Deactivate Team",
          icon: Ban,
          action: () => onDeactivateTeam(team),
          disabled: !isSuperAdmin,
          tooltip: !isSuperAdmin ? "Superadmin privilege required" : undefined,
          color: "text-rose-700 hover:bg-rose-50",
        },
  ];

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus management on open
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      itemRefs.current[0]?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (focusedIndex + 1) % menuItems.length;
      setFocusedIndex(next);
      itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (focusedIndex - 1 + menuItems.length) % menuItems.length;
      setFocusedIndex(prev);
      itemRefs.current[prev]?.focus();
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Actions for ${team.name}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          className="absolute right-0 z-40 mt-1 w-44 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 outline-none"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={focusedIndex === index ? 0 : -1}
                disabled={item.disabled}
                title={item.tooltip}
                onClick={() => {
                  if (item.disabled) return;
                  setIsOpen(false);
                  item.action();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors text-left",
                  item.color,
                  item.disabled &&
                    "opacity-40 cursor-not-allowed hover:bg-transparent",
                  focusedIndex === index && !item.disabled && "bg-slate-100/70",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamRowMenu;

