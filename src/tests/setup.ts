import "dotenv/config";
import { createUser, deleteAllUsers } from "../models/users/user.repository.js";
import { app } from "../app.js";
import {
  removeAllLedgers,
  createLedger,
} from "../models/ledger/ledger.repository.js";
import {
  removeAllWallets,
  createWallet,
} from "../models/wallets/wallet.repository.js";
deleteAllUsers().then(() => {
  createUser({
    outside_id: "user-001",
    role: "user",
    status: "active",
  }).then((x) => {
    removeAllWallets().then(() => {
      removeAllLedgers().then(() => {
        createWallet({
          current_balance: "10000",
          type: "USDT",
          user_id: x?.id!,
        }).then((w0) => {
          createLedger({
            wallet_id: w0?.id!,
          });
        });
        createWallet({
          current_balance: "0",
          type: "XAUT",
          user_id: x?.id!,
        }).then((w1) => {
          createLedger({
            wallet_id: w1?.id!,
          });
        });
      });
    });
  });
  createUser({
    outside_id: "compliance-001",
    role: "compliance",
    status: "active",
  });
});
