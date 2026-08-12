"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import {
  categoryFormSchema,
  CATEGORY_COLOR_SWATCHES,
  type CategoryFormValues,
} from "@/lib/validations/category";
import { CategoryIcon, ICON_PICKER_OPTIONS } from "./category-icon";
import type { Category, CategoryType } from "@/types";

export function CategoryFormDialog({
  category,
  defaultType,
  open,
  onOpenChange,
}: {
  category?: Category | null;
  defaultType: CategoryType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isPending = createCategory.isPending || updateCategory.isPending;
  const isEdit = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      icon: category?.icon ?? "circle",
      color: category?.color ?? CATEGORY_COLOR_SWATCHES[0],
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        type: category?.type ?? defaultType,
        icon: category?.icon ?? "circle",
        color: category?.color ?? CATEGORY_COLOR_SWATCHES[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id, defaultType]);

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (isEdit && category) {
        await updateCategory.mutateAsync({ id: category.id, input: values });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync(values);
        toast.success("Category added");
      }
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename this category or change its icon and color."
              : `Create a new ${defaultType} category.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLOR_SWATCHES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        style={{ backgroundColor: color }}
                        className={cn(
                          "size-7 rounded-full transition-transform",
                          field.value === color
                            ? "ring-foreground scale-110 ring-2 ring-offset-2 ring-offset-[var(--popover)]"
                            : "hover:scale-110"
                        )}
                        aria-label={color}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <div className="grid grid-cols-8 gap-1.5">
                    {ICON_PICKER_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => field.onChange(icon)}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border transition-colors",
                          field.value === icon
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted border-transparent"
                        )}
                      >
                        <CategoryIcon name={icon} className="size-4" />
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
