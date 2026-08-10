import express from "express";
import swaggerUi from "swagger-ui-express";

import { userRouter } from "./routes/user.routes.js";
import { openApiDocument } from "./openapi/document.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { quoteRouter } from "./routes/quote.routes.js";
import {
  exchangeComplianceRouter,
  exchangeRouter,
} from "./routes/exchange.routes.js";

export const app = express();

app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(authenticationMiddleware);

app.use("/users", userRouter);
app.use("/wallets", walletRouter);
app.use("/quotes", quoteRouter);
app.use("/exchanges", exchangeRouter);
app.use("/compliance/exchanges", exchangeComplianceRouter);
