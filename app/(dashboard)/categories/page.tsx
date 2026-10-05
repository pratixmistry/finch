import type { Metadata } from "next";
import { CategoryListSection } from "@/components/categories/category-list-section";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Categories — Finch" };

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Categories"
        description="Organize your income and expenses. Categories with past transactions are archived instead of deleted."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <CategoryListSection type="expense" title="Expense categories" />
        <CategoryListSection type="income" title="Income categories" />
      </div>
    </div>
  );
}
