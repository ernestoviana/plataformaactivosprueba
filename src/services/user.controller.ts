import { createUser, getUsers } from "../models/users/user.repository.js";
import { CreateUserInput } from "../models/users/user.schema.js";

export async function getAllUsers() {
  const users = await getUsers();
  return users;
}

export async function createUserController(req: CreateUserInput) {
  try {
    const createdUser = await createUser(req);
    return createdUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
