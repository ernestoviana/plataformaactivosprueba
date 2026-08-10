import { WalletTable } from "../db/types.js";

export interface WalletMovements {
  wallet_id: string;
  wallet_type: string;
  current_balance: string;
  withheld_balance: string;
  total_balance: string;
  movements: MovementDetail[];
}

export interface MovementDetail {
  type: string;
  amount: string;
  current_balance: string;
  new_balance: string;
  balance_change: string;
  date: string;
}

export interface QuoteCreationRes {
  data?: QuoteCreationData;
  success: boolean;
  error_message?: string;
}

export interface ExchangeDetailRes {
  data?: ExchangeDetail;
  success: boolean;
  error_message?: string;
}
export interface QuoteCreationData {
  id: string;
  status: string;
  wallet_source: WalletTable;
  wallet_destination: WalletTable;
  creation_date: string;
  expiry_date: string;
  source_value: string;
  destination_value: string;
  fee: string;
}

export interface ExchangeDetail {
  id: string;
  idempotency_key: string;
  requires_followup: boolean;
  status:
    | "CREATED"
    | "PENDING_REVIEW"
    | "PROCESSING"
    | "COMPLETED"
    | "REJECTED"
    | "FAILED";
  wallet_source: WalletTable;
  wallet_destination: WalletTable;
  movements: MovementDetail[];
  quote: QuoteData;
}

export interface QuoteData {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "USED";
  creation_date: string;
  expiry_date: string;
  source_value: string;
  destination_value: string;
  fee: string;
}
