import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { z } from "zod";
import { getAllUsers } from "../services/user.controller.js";
import { createUserSchema } from "../models/users/user.schema.js";

export const userRouter = Router();

userRouter
  .get("/", authorize("admin"), async (req, res) => {
    const users = await getAllUsers();
    return res.json(users);
  })
  .post("/", authorize("admin"), async (req, res) => {
    const userToCreate = createUserSchema.safeParse(req.body);

    if (!userToCreate.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: z.treeifyError(userToCreate.error),
      });
    }
    return res.status(201).json(userToCreate.data);
  });
