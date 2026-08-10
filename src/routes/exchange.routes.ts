import { Router } from "express";
import { createExchangeSchema } from "../models/exchanges/exchange.schema.js";
import z from "zod";
import { authorize } from "../middleware/auth.middleware.js";
import {
  approveExchange,
  executeExchange,
  getExchangeDetail,
  getExchangesPending,
  rejectExchange,
} from "../services/transactions.controller.js";

export const exchangeRouter = Router();
export const exchangeComplianceRouter = Router();

exchangeRouter
  .post("/", authorize("user"), async (req, res) => {
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const idempotencyKey = req.header("Idempotency-Key");
    if (!idempotencyKey) {
      return res
        .status(400)
        .json({ message: "Missing Idempotency Key Header" });
    }
    const exchangeData = createExchangeSchema.safeParse(req.body);
    if (!exchangeData.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: z.treeifyError(exchangeData.error),
      });
    }
    const result = await executeExchange(
      exchangeData.data,
      userId,
      idempotencyKey
    );
    if (result?.success) {
      return res.json(result.data);
    } else {
      if (result?.error_message === "Conflict") {
        return res.status(409).json({ message: "Conflict" });
      }
      return res.status(400).json({ message: result?.error_message });
    }
  })
  .get("/:id", authorize("user"), async (req, res) => {
    const exchangeId = req.params.id as string;
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const exchange = await getExchangeDetail(exchangeId, userId);
    if (!exchange.success) {
      return res.status(400).json({ message: exchange.error_message });
    } else {
      return res.json(exchange.data);
    }
  });

exchangeComplianceRouter
  .get("/pending", authorize("compliance"), async (req, res) => {
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const exchange = await getExchangesPending();
    if (!exchange.success) {
      return res.status(400).json({ message: "No pending exchanges" });
    } else {
      return res.json(exchange.data);
    }
  })
  .patch("/:id/approve", authorize("compliance"), async (req, res) => {
    const exchangeId = req.params.id as string;
    if (!exchangeId) {
      return res.status(400).json({ message: "Missing Exchange Id" });
    }
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const result = await approveExchange(exchangeId);
    if (result?.success) {
      return res.json(result.data);
    } else {
      return res.status(400).json({ message: result?.error_message });
    }
  })
  .patch("/:id/reject", authorize("compliance"), async (req, res) => {
    const exchangeId = req.params.id as string;
    if (!exchangeId) {
      return res.status(400).json({ message: "Missing Exchange Id" });
    }
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const result = await rejectExchange(exchangeId);
    if (result?.success) {
      return res.json(result.data);
    } else {
      return res.status(400).json({ message: result?.error_message });
    }
  });
