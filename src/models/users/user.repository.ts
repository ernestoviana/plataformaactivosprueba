import { randomUUID } from "node:crypto";

import { db } from "../../db/db.js";
import type { CreateUserInput, UpdateUserInput } from "./user.schema.js";

export function getUsers() {
  return db.selectFrom("users").selectAll().execute();
}

export function getUserById(id: string) {
  return db
    .selectFrom("users")
    .selectAll()
    .where("outside_id", "=", id)
    .executeTakeFirst();
}

export function createUser(input: CreateUserInput) {
  return db
    .insertInto("users")
    .values({
      id: randomUUID(),
      outside_id: input.outside_id,
      role: input.role,
      status: input.status,
    })
    .returningAll()
    .executeTakeFirst();
}

export function updateUser(id: string, input: UpdateUserInput) {
  return db
    .updateTable("users")
    .set({
      role: input.role,
      status: input.status,
    })
    .where("outside_id", "=", id)
    .returningAll()
    .executeTakeFirst();
}

export function deleteUser(id: string) {
  return db
    .deleteFrom("users")
    .where("outside_id", "=", id)
    .returningAll()
    .executeTakeFirst();
}

export function deleteAllUsers() {
  return db.deleteFrom("users").execute();
}

export function dropUsersTable() {
  return db.schema.dropTable("users").execute();
}
