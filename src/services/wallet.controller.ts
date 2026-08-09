import { getLedgerByWalletId } from "../models/ledger/ledger.repository.js";
import { getMovementsByLedgerId } from "../models/movements/movement.repository.js";
import { getUserById } from "../models/users/user.repository.js";
import { getWalletsByUserId } from "../models/wallets/wallet.repository.js";

export async function getUserWallets(userId: string) {
  const user = await getUserById(userId);
  const wallets = await getWalletsByUserId(user?.id!);
  return wallets;
}

export async function getWalletMovement(walletId: string) {
  const ledger = await getLedgerByWalletId(walletId);
  if (!ledger) {
    return [];
  }
  const movements = getMovementsByLedgerId(ledger.id);
  return movements;
}
