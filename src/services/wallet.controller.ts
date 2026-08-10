import { MovementDetail, WalletMovements } from "../dtos/dtos.js";
import { getLedgerByWalletId } from "../models/ledger/ledger.repository.js";
import { getMovementsByLedgerId } from "../models/movements/movement.repository.js";
import { getUserById } from "../models/users/user.repository.js";
import {
  getWalletById,
  getWalletsByUserId,
} from "../models/wallets/wallet.repository.js";
import { Decimal } from "decimal.js";

export async function getUserWallets(userId: string) {
  const user = await getUserById(userId);
  const wallets = await getWalletsByUserId(user?.id!);
  return wallets;
}

export async function getWallet(walletId: string, userId: string) {
  const wallet = await getWalletById(walletId);
  const user = await getUserById(userId);
  if (!user || wallet?.id !== user.id) {
    return undefined;
  }
  return wallet;
}

export async function getWalletMovements(walletId: string) {
  const wallet = await getWalletById(walletId);
  if (!wallet) {
    return undefined;
  }
  const ledger = await getLedgerByWalletId(walletId);
  if (!ledger) {
    return undefined;
  }
  const movements = await getMovementsByLedgerId(ledger.id);
  const movementDetail: MovementDetail[] = [];
  movements.map((movement) => {
    const balance_change = new Decimal(movement.new_balance).sub(
      new Decimal(movement.current_balance)
    );
    movementDetail.push({
      type: movement.type,
      amount: movement.amount,
      current_balance: movement.current_balance,
      new_balance: movement.new_balance,
      balance_change: balance_change.toString(),
      date: movement.execution_date,
    });
  });
  const movementsData: WalletMovements = {
    wallet_id: walletId,
    wallet_type: wallet.type,
    current_balance: wallet.current_balance,
    withheld_balance: wallet.withheld_balance,
    total_balance: wallet.total_balance,
    movements: movementDetail,
  };

  return movementsData;
}
