// Hand-authored to mirror supabase/migrations/*.sql. If the schema changes,
// regenerate with `npx supabase gen types typescript --project-id <id>` and
// reconcile with the domain helpers in lib/queries instead of hand-editing
// blindly.

export type AccountType =
  | "cash"
  | "bank"
  | "credit_card"
  | "wallet"
  | "investment"
  | "other_asset"
  | "loan";

export type CategoryType = "income" | "expense";

export type TransactionType = "income" | "expense" | "investment" | "transfer";

export type InvestmentAssetType =
  | "stock"
  | "mutual_fund"
  | "etf"
  | "crypto"
  | "fixed_deposit"
  | "bond"
  | "other";

export type InvestmentTxnType = "buy" | "sell";

export type BudgetPeriod = "monthly" | "quarterly" | "yearly";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          currency: string;
          timezone: string;
          date_format: string;
          week_start_day: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          timezone?: string;
          date_format?: string;
          week_start_day?: number;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: AccountType;
          currency: string;
          opening_balance: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: AccountType;
          currency?: string;
          opening_balance?: number | string;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: CategoryType;
          icon: string;
          color: string;
          is_active: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: CategoryType;
          icon?: string;
          color?: string;
          is_active?: boolean;
          is_default?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string | null;
          transfer_account_id: string | null;
          type: TransactionType;
          amount: string;
          transaction_date: string;
          description: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id?: string | null;
          transfer_account_id?: string | null;
          type: TransactionType;
          amount: number | string;
          transaction_date: string;
          description?: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [];
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          name: string;
          asset_type: InvestmentAssetType;
          symbol: string | null;
          quantity: string;
          average_buy_price: string;
          current_price: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          name: string;
          asset_type: InvestmentAssetType;
          symbol?: string | null;
          quantity?: number | string;
          average_buy_price?: number | string;
          current_price?: number | string;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["investments"]["Insert"]>;
        Relationships: [];
      };
      investment_transactions: {
        Row: {
          id: string;
          user_id: string;
          investment_id: string;
          type: InvestmentTxnType;
          quantity: string;
          price: string;
          fees: string;
          transaction_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          investment_id: string;
          type: InvestmentTxnType;
          quantity: number | string;
          price: number | string;
          fees?: number | string;
          transaction_date: string;
          notes?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["investment_transactions"]["Insert"]
        >;
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: string;
          period: BudgetPeriod;
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number | string;
          period?: BudgetPeriod;
          start_date: string;
          end_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["budgets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      account_type: AccountType;
      category_type: CategoryType;
      transaction_type: TransactionType;
      investment_asset_type: InvestmentAssetType;
      investment_txn_type: InvestmentTxnType;
      budget_period: BudgetPeriod;
    };
    CompositeTypes: Record<string, never>;
  };
}
