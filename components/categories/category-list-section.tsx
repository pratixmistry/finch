"use client";

import * as React from "react";
import { ArchiveRestore, MoreHorizontal, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useCategories, useRemoveCategory, useSetCategoryActive } from "@/hooks/use-categories";
import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryIcon } from "./category-icon";
import type { Category, CategoryType } from "@/types";

export function CategoryListSection({ type, title }: { type: CategoryType; title: string }) {
  const { data: categories, isLoading } = useCategories({ type, includeArchived: true });
  const removeCategory = useRemoveCategory();
  const setActive = useSetCategoryActive();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [pendingRemove, setPendingRemove] = React.useState<Category | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  async function confirmRemove() {
    if (!pendingRemove) return;
    try {
      const result = await removeCategory.mutateAsync(pendingRemove.id);
      toast.success(
        result.archived
          ? "Category archived (it has past transactions)"
          : "Category deleted"
      );
    } catch {
      toast.error("Couldn't remove this category");
    } finally {
      setPendingRemove(null);
    }
  }

  async function unarchive(category: Category) {
    try {
      await setActive.mutateAsync({ id: category.id, isActive: true });
      toast.success("Category unarchived");
    } catch {
      toast.error("Couldn't unarchive this category");
    }
  }

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button variant="outline" size="sm" onClick={openAdd}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState icon={Tags} title={`No ${type} categories yet`} className="py-8" />
      ) : (
        <ul className="divide-y">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-3 py-2.5">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${category.color}1a`, color: category.color }}
              >
                <CategoryIcon name={category.icon} className="size-4" />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span>
              {!category.isActive && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  Archived
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="shrink-0">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(category)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  {category.isActive ? (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setPendingRemove(category)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => unarchive(category)}>
                      <ArchiveRestore className="size-4" />
                      Unarchive
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      <CategoryFormDialog
        category={editing}
        defaultType={type}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog open={!!pendingRemove} onOpenChange={(open) => !open && setPendingRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove &quot;{pendingRemove?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              If this category has past transactions it will be archived instead of deleted,
              so your history stays intact. Otherwise it&apos;s removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
