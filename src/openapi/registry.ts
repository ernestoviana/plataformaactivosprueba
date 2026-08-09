import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  createUserSchema,
  updateUserSchema,
  userSchema,
} from "../models/users/user.schema.js";

extendZodWithOpenApi(z);
export const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/users",
  summary: "Obtiene todos los usuarios",
  request: {
    headers: z.object({
      "X-User-Id": z
        .string()
        .describe("Encabezado que simula autenticación y autorización"),
    }),
  },
  responses: {
    200: {
      description: "Lista de usuarios",
      content: {
        "application/json": {
          schema: z.array(userSchema),
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Forbidden",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/users",
  summary: "Crea un usuario nuevo",
  request: {
    headers: z.object({
      "X-User-Id": z
        .string()
        .describe("Encabezado que simula autenticación y autorización"),
    }),
    body: {
      content: {
        "application/json": {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Usuario creado",
      content: {
        "application/json": {
          schema: userSchema,
        },
      },
    },
    400: {
      description: "Invalid input",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Forbidden",
    },
  },
});
