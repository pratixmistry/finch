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
import { IconTile } from "@/components/shared/icon-tile";
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
    <section className="surface pt-5 pb-2">
      <div className="mb-2 flex items-center justify-between gap-3 px-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="secondary" size="sm" onClick={openAdd}>
          <Plus />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2 px-5 pb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState icon={Tags} title={`No ${type} categories yet`} className="py-8" />
      ) : (
        <ul>
          {categories.map((category) => (
            <li key={category.id} className="group/row flex items-center gap-3 pr-3 pl-5">
              <IconTile color={category.color} size="sm">
                <CategoryIcon name={category.icon} />
              </IconTile>
              <div className="flex min-w-0 flex-1 items-center gap-3 border-b py-2 group-last/row:border-b-0">
              <span className="min-w-0 flex-1 truncate text-base font-medium">{category.name}</span>
              {!category.isActive && (
                <Badge variant="secondary">
                  Archived
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground shrink-0" aria-label="More options">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(category)}>
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  {category.isActive ? (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setPendingRemove(category)}
                    >
                      <Trash2 />
                      Remove
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => unarchive(category)}>
                      <ArchiveRestore />
                      Unarchive
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
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
    </section>
  );
}
