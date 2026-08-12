"use client";

import * as React from "react";
import type { Transaction, TransactionType } from "@/types";

interface TransactionSheetState {
  open: boolean;
  mode: "create" | "edit";
  transaction: Transaction | null;
  defaultType: TransactionType;
}

interface TransactionSheetContextValue {
  state: TransactionSheetState;
  openCreate: (defaultType?: TransactionType) => void;
  openEdit: (transaction: Transaction) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

const TransactionSheetContext = React.createContext<TransactionSheetContextValue | null>(null);

const INITIAL_STATE: TransactionSheetState = {
  open: false,
  mode: "create",
  transaction: null,
  defaultType: "expense",
};

export function TransactionSheetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<TransactionSheetState>(INITIAL_STATE);

  const openCreate = React.useCallback((defaultType: TransactionType = "expense") => {
    setState({ open: true, mode: "create", transaction: null, defaultType });
  }, []);

  const openEdit = React.useCallback((transaction: Transaction) => {
    setState({ open: true, mode: "edit", transaction, defaultType: transaction.type });
  }, []);

  const close = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const setOpen = React.useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, open }));
  }, []);

  const value = React.useMemo(
    () => ({ state, openCreate, openEdit, close, setOpen }),
    [state, openCreate, openEdit, close, setOpen]
  );

  return (
    <TransactionSheetContext.Provider value={value}>{children}</TransactionSheetContext.Provider>
  );
}

export function useTransactionSheet() {
  const ctx = React.useContext(TransactionSheetContext);
  if (!ctx) {
    throw new Error("useTransactionSheet must be used within TransactionSheetProvider");
  }
  return ctx;
}
