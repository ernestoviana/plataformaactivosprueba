import express from "express";
import swaggerUi from "swagger-ui-express";

import { userRouter } from "./routes/user.routes.js";
import { openApiDocument } from "./openapi/document.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";

export const app = express();

app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(authenticationMiddleware);

app.use("/users", userRouter);
