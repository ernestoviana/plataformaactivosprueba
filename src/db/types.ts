export interface Database {
  users: UserTable;
  wallets: WalletTable;
  quotes: QuoteTable;
  exchanges: Exchange;
  ledger: Ledger;
  movements: Movement;
}
export interface UserTable {
  id: string;
  outside_id: string;
  role: "admin" | "compliance" | "user";
  status: string;
}

export interface WalletTable {
  id: string;
  user_id: string;
  type: "USDT" | "XAUT";
  current_balance: string;
  withheld_balance: string;
  total_balance: string;
}

export interface QuoteTable {
  id: string;
  user_id: string;
  wallet_source_id: string;
  wallet_destination_id: string;
  status: "ACTIVE" | "EXPIRED" | "USED";
  creation_date: string;
  expiry_date: string;
  source_value: string;
  destination_value: string;
  fee: string;
}

export interface Exchange {
  id: string;
  quote_id: string;
  idempotency_key: string;
  requires_followup: boolean;
  status:
    | "CREATED"
    | "PENDING_REVIEW"
    | "PROCESSING"
    | "COMPLETED"
    | "REJECTED"
    | "FAILED";
}

export interface Ledger {
  id: string;
  wallet_id: string;
  created_date: string;
}

export interface Movement {
  id: string;
  ledger_id: string;
  wallet_id: string;
  exchange_id: string;
  type: "DEBIT" | "CREDIT" | "FEE";
  amount: string;
  current_balance: string;
  new_balance: string;
  sequence: number;
  previous_hash: string;
  hash: string;
  execution_date: string;
}
