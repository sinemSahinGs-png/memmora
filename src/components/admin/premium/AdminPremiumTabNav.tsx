"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ADMIN_PREMIUM_TOP_TABS,
  ADMIN_PREMIUM_BOTTOM_TABS,
  type AdminPremiumTab,
  type AdminPremiumBottomTab,
} from "./admin-premium-types";
import {
  IconGrid,
  IconLeaf,
  IconMedia,
  IconQuiz,
} from "./AdminPremiumIcons";

const TAB_ICONS: Record<AdminPremiumBottomTab, ComponentType<{ className?: string }>> = {
  leaves: IconLeaf,
  memories: IconGrid,
  gallery: IconMedia,
  quiz: IconQuiz,
  film: IconMedia,
};

interface AdminPremiumTabNavProps {
  activeTab: AdminPremiumTab;
  onChange: (tab: AdminPremiumBottomTab) => void;
  className?: string;
}

export function AdminPremiumTabNav({
  activeTab,
  onChange,
  className,
}: AdminPremiumTabNavProps) {
  return (
    <div className="admin-premium-tabs-shell admin-premium-reveal admin-premium-reveal--d4">
      <nav
        className={cn("admin-premium-tabs", className)}
        aria-label="Admin navigasyon"
      >
        {ADMIN_PREMIUM_TOP_TABS.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id];
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => {
                onChange(tab.id);
                e.currentTarget.blur();
              }}
              className={cn(
                "admin-premium-tab admin-premium-btn-enter admin-premium-interactive",
                `admin-premium-btn-enter--d${Math.min(index + 1, 4)}`,
                active && "admin-premium-tab--active",
                active && tab.id === "gallery" && "admin-premium-tab--gallery-active"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <motion.span
                  layoutId="admin-premium-tab-pill"
                  className="admin-premium-tab__pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

interface AdminPremiumBottomNavProps {
  activeTab: AdminPremiumTab;
  onChange: (tab: AdminPremiumBottomTab) => void;
}

function isBottomTab(tab: AdminPremiumTab): tab is AdminPremiumBottomTab {
  return ADMIN_PREMIUM_BOTTOM_TABS.some((item) => item.id === tab);
}

export function AdminPremiumBottomNav({
  activeTab,
  onChange,
}: AdminPremiumBottomNavProps) {
  const bottomActive = isBottomTab(activeTab) ? activeTab : null;

  return (
    <nav className="admin-premium-bottom-nav" aria-label="Mobil navigasyon">
      {ADMIN_PREMIUM_BOTTOM_TABS.map((tab, index) => {
        const Icon = TAB_ICONS[tab.id];
        const active = bottomActive === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              onChange(tab.id);
              e.currentTarget.blur();
            }}
            className={cn(
              "admin-premium-bottom-nav__item admin-premium-btn-enter admin-premium-interactive",
              `admin-premium-btn-enter--d${Math.min(index + 1, 4)}`,
              active && "admin-premium-bottom-nav__item--active",
              active && tab.id === "gallery" && "admin-premium-bottom-nav__item--gallery-active"
            )}
            aria-current={active ? "page" : undefined}
          >
            {active ? (
              <motion.span
                layoutId="admin-premium-bottom-pill"
                className="admin-premium-bottom-nav__pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Icon />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
