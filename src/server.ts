import "dotenv/config";
import { app } from "./app.js";
import { createUser, deleteAllUsers } from "./models/users/user.repository.js";
import {
  createWallet,
  removeAllWallets,
} from "./models/wallets/wallet.repository.js";
import {
  createLedger,
  removeAllLedgers,
} from "./models/ledger/ledger.repository.js";
import { calculateQuote } from "./services/transactions.controller.js";
import { removeAllQuotes } from "./models/quotes/quote.repository.js";
import { removeAllMovements } from "./models/movements/movement.repository.js";
const puerto = 3000;

deleteAllUsers().then(() => {
  createUser({
    outside_id: "user-001",
    role: "user",
    status: "active",
  }).then((x) => {
    removeAllQuotes().then(() => {
      removeAllMovements();
    });
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
        })
          .then((w1) => {
            createLedger({
              wallet_id: w1?.id!,
            });
          })
          .then(() => {
            app.listen(puerto, () => {
              console.log(
                "Plataforma de activos corriendo en el puerto " + puerto
              );
              console.log(
                "Para ver la documentación click a http://localhost:3000/docs"
              );
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
// app.listen(puerto, () => {
//   console.log("Plataforma de activos corriendo en el puerto " + puerto);
//   console.log("Para ver la documentación click a http://localhost:3000/docs");
// });
