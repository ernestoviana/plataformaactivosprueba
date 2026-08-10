import { Router } from "express";
import {
  getUserWallets,
  getWallet,
  getWalletMovements,
} from "../services/wallet.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

export const walletRouter = Router();

walletRouter
  .get("/", authorize("user"), async (req, res) => {
    const headerUserId = req.header("X-User-Id");
    if (!headerUserId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const wallets = await getUserWallets(headerUserId);
    return res.json(wallets);
  })
  .get("/:id", authorize("user"), async (req, res) => {
    const headerUserId = req.header("X-User-Id");
    if (!headerUserId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const walletId = req.params.id as string;
    if (!walletId) {
      return res.status(400).json({ message: "Missing Wallet Id" });
    }
    const wallet = await getWallet(walletId, headerUserId);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.json(wallet);
  })
  .get("/:id/movements", authorize("user"), async (req, res) => {
    const walletId = req.params.id as string;
    if (!walletId) {
      return res.status(400).json({ message: "Missing Wallet Id" });
    }
    const movements = await getWalletMovements(walletId);
    if (!movements) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.json(movements);
  });
