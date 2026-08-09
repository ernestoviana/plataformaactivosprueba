import { Router } from "express";
import { getUserWallets } from "../services/wallet.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

export const walletRouter = Router();

walletRouter.get("/", authorize("user"), async (req, res) => {
  const headerUserId = req.header("X-User-Id");
  if (!headerUserId) {
    return res.status(401).json({ message: "Missing User Id Header" });
  }
  const wallets = await getUserWallets(headerUserId);
  return res.json(wallets);
});
