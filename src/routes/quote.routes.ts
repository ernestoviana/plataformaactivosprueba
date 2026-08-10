import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { calculateQuoteSchema } from "../models/quotes/quote.schema.js";
import { z } from "zod";
import {
  calculateQuote,
  getQuoteById,
  getUserQuotes,
} from "../services/transactions.controller.js";

export const quoteRouter = Router();

quoteRouter
  .post("/", authorize("user"), async (req, res) => {
    const quote = calculateQuoteSchema.safeParse(req.body);
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    if (!quote.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: z.treeifyError(quote.error),
      });
    }
    const result = await calculateQuote(quote.data, userId);
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      return res.status(400).json({
        message: result.error_message,
      });
    }
  })
  .get("/:id", authorize("user"), async (req, res) => {
    const quoteId = req.params.id as string;
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const quote = await getQuoteById(quoteId, userId);
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }
    return res.json(quote);
  })
  .get("/", authorize("user"), async (req, res) => {
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ message: "Missing User Id Header" });
    }
    const quotes = await getUserQuotes(userId);
    return res.json(quotes);
  });
