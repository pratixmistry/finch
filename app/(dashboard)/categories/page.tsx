import type { Metadata } from "next";
import { CategoryListSection } from "@/components/categories/category-list-section";

export const metadata: Metadata = { title: "Categories — Finch" };

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-muted-foreground text-sm">
          Organize your income and expenses. Categories with past transactions are
          archived instead of deleted.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryListSection type="expense" title="Expense categories" />
        <CategoryListSection type="income" title="Income categories" />
      </div>
    </div>
  );
}
