import express from "express";
import "dotenv/config";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";
import { userRouter } from "./routes/user.routes.js";
import { createUser, deleteAllUsers } from "./models/users/user.repository.js";
const app = express();
const puerto = 3000;

// init script
// deleteAllUsers().then(() => {
//   createUser({
//     outside_id: "user-001",
//     role: "user",
//     status: "active",
//   });
//   createUser({
//     outside_id: "compliance-001",
//     role: "compliance",
//     status: "active",
//   });
// });

app.use(express.json());

// added middleware for authorization
app.use(authenticationMiddleware);

// routes registration
app.use("/users", userRouter);

app.listen(puerto, () => {
  console.log("Plataforma de activos corriendo en el puerto " + puerto);
});
