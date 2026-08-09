import "dotenv/config";
import { app } from "./app.js";
import { createUser, deleteAllUsers } from "./models/users/user.repository.js";
import {
  createWallet,
  removeAllWallets,
} from "./models/wallets/wallet.repository.js";
const puerto = 3000;

//init script
// deleteAllUsers().then(() => {
//   createUser({
//     outside_id: "user-001",
//     role: "user",
//     status: "active",
//   }).then((x) => {
//     removeAllWallets().then(() => {
//       createWallet({
//         current_balance: "10000",
//         type: "USDT",
//         user_id: x?.id!,
//       }).then(() => {
//         app.listen(puerto, () => {
//           console.log("Plataforma de activos corriendo en el puerto " + puerto);
//           console.log(
//             "Para ver la documentación click a http://localhost:3000/docs"
//           );
//         });
//       });
//       createWallet({
//         current_balance: "0",
//         type: "XAUT",
//         user_id: x?.id!,
//       });
//     });
//   });
//   createUser({
//     outside_id: "compliance-001",
//     role: "compliance",
//     status: "active",
//   });
// });
app.listen(puerto, () => {
  console.log("Plataforma de activos corriendo en el puerto " + puerto);
  console.log("Para ver la documentación click a http://localhost:3000/docs");
});
