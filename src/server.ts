import express from "express";
import "dotenv/config";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";
import { userRouter } from "./routes/user.routes.js";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi/document.js";
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

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
// added middleware for authorization
app.use(authenticationMiddleware);

// routes registration
app.use("/users", userRouter);

app.listen(puerto, () => {
  console.log("Plataforma de activos corriendo en el puerto " + puerto);
  console.log("Para ver la documentación click a http://localhost:3000/docs");
});
