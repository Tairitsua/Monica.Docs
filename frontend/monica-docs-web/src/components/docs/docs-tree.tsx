"use client";

import { ChevronRight, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { Locale } from "@/content/home";
import type { DocTreeItem } from "@/lib/documentation-types";
import { docsPath } from "@/lib/routes";

type DocsTreeProps = {
  locale: Locale;
  items: DocTreeItem[];
  activeSlug?: string;
  compact?: boolean;
};

type GroupOverrides = Readonly<Record<string, boolean>>;

const EMPTY_GROUP_OVERRIDES: GroupOverrides = Object.freeze({});
const groupOverrideCache = new Map<string, { serialized: string | null; value: GroupOverrides }>();
const groupOverrideListeners = new Map<string, Set<() => void>>();

export function DocsTree({ locale, items, activeSlug, compact = false }: DocsTreeProps) {
  const activeGroups = useMemo(
    () => findActiveGroupPaths(items, activeSlug),
    [activeSlug, items],
  );
  const storageKey = `monica-docs-tree:${locale}`;
  const groupOverrides = useGroupOverrides(storageKey);
  const openGroups = useMemo(() => {
    const next = new Set(activeGroups);
    for (const [path, isOpen] of Object.entries(groupOverrides)) {
      if (isOpen) {
        next.add(path);
      } else {
        next.delete(path);
      }
    }
    return next;
  }, [activeGroups, groupOverrides]);

  function toggleGroup(path: string) {
    const nextValue = !openGroups.has(path);
    writeGroupOverride(storageKey, path, nextValue);
  }

  return (
    <nav className={`docs-tree${compact ? " is-compact" : ""}`} aria-label={locale === "en" ? "Documentation navigation" : "文档导航"}>
      <TreeItems
        locale={locale}
        items={items}
        activeSlug={activeSlug}
        compact={compact}
        openGroups={openGroups}
        onToggleGroup={toggleGroup}
      />
    </nav>
  );
}

type TreeItemsProps = {
  locale: Locale;
  items: DocTreeItem[];
  activeSlug?: string;
  compact: boolean;
  openGroups: ReadonlySet<string>;
  onToggleGroup: (path: string) => void;
};

function TreeItems({ locale, items, activeSlug, compact, openGroups, onToggleGroup }: TreeItemsProps) {
  return (
    <ul>
      {items.map((item) => {
        const itemKey = `${item.path}-${item.slug ?? "folder"}`;
        if (item.isDocument && item.slug) {
          const isActive = item.slug === activeSlug;
          return (
            <li key={itemKey}>
              <Link className={isActive ? "is-active" : undefined} href={docsPath(locale, item.slug)} aria-current={isActive ? "page" : undefined}>
                <FileText aria-hidden="true" size={15} />
                <span>{item.title}</span>
                <ChevronRight aria-hidden="true" size={14} />
              </Link>
            </li>
          );
        }

        const groupId = `docs-tree-${item.path.replace(/[^a-z\d_-]+/giu, "-")}`;
        const isOpen = !compact || openGroups.has(item.path);
        return (
          <li className="docs-tree-group" key={itemKey}>
            {compact
              ? (
                  <button
                    type="button"
                    aria-controls={groupId}
                    aria-expanded={isOpen}
                    onClick={() => onToggleGroup(item.path)}
                  >
                    <Folder aria-hidden="true" size={14} />
                    <span>{item.title}</span>
                    <ChevronRight aria-hidden="true" size={14} />
                  </button>
                )
              : <span>{item.title}</span>}
            {item.children.length > 0 && (
              <div id={groupId} hidden={!isOpen}>
                {isOpen && (
                  <TreeItems
                    locale={locale}
                    items={item.children}
                    activeSlug={activeSlug}
                    compact={compact}
                    openGroups={openGroups}
                    onToggleGroup={onToggleGroup}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function useGroupOverrides(storageKey: string): GroupOverrides {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToGroupOverrides(storageKey, onStoreChange),
    [storageKey],
  );
  const getSnapshot = useCallback(() => readGroupOverrides(storageKey), [storageKey]);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_GROUP_OVERRIDES);
}

function subscribeToGroupOverrides(storageKey: string, listener: () => void): () => void {
  const listeners = groupOverrideListeners.get(storageKey) ?? new Set<() => void>();
  listeners.add(listener);
  groupOverrideListeners.set(storageKey, listeners);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      groupOverrideListeners.delete(storageKey);
    }
  };
}

function readGroupOverrides(storageKey: string): GroupOverrides {
  let serialized: string | null = null;
  try {
    serialized = window.sessionStorage.getItem(storageKey);
  } catch {
    return groupOverrideCache.get(storageKey)?.value ?? EMPTY_GROUP_OVERRIDES;
  }

  const cached = groupOverrideCache.get(storageKey);
  if (cached?.serialized === serialized) {
    return cached.value;
  }

  const value = parseGroupOverrides(serialized);
  groupOverrideCache.set(storageKey, { serialized, value });
  return value;
}

function writeGroupOverride(storageKey: string, path: string, isOpen: boolean) {
  const value = Object.freeze({ ...readGroupOverrides(storageKey), [path]: isOpen });
  const serialized = JSON.stringify(value);
  groupOverrideCache.set(storageKey, { serialized, value });

  try {
    window.sessionStorage.setItem(storageKey, serialized);
  } catch {
    // The in-memory snapshot still preserves toggles during this client run.
  }

  groupOverrideListeners.get(storageKey)?.forEach((listener) => listener());
}

function parseGroupOverrides(serialized: string | null): GroupOverrides {
  try {
    const value: unknown = JSON.parse(serialized ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return EMPTY_GROUP_OVERRIDES;
    }

    return Object.freeze(Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean"),
    ));
  } catch {
    return EMPTY_GROUP_OVERRIDES;
  }
}

function findActiveGroupPaths(items: DocTreeItem[], activeSlug?: string): string[] {
  if (!activeSlug) {
    return [];
  }

  for (const item of items) {
    if (item.isDocument && item.slug === activeSlug) {
      return [];
    }

    const childPaths = findActiveGroupPaths(item.children, activeSlug);
    const containsActiveDocument = item.children.some((child) => child.isDocument && child.slug === activeSlug);
    if (containsActiveDocument || childPaths.length > 0) {
      return [item.path, ...childPaths];
    }
  }

  return [];
}
