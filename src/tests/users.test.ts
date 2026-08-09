import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";

const executeTakeFirst = vi.fn();

vi.mock("../src/db/database.js", () => ({
  db: {
    selectFrom: vi.fn(() => ({
      select: vi.fn(() => ({
        where: vi.fn(() => ({
          executeTakeFirst,
        })),
      })),
    })),
  },
}));

describe("GET /users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("retorna 401 cuando X-User-Id no esta presente", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Missing User Id Header",
    });
  });

  it("returns 401 when user does not exist", async () => {
    const response = await request(app)
      .get("/users")
      .set("X-User-Id", "this-user-definitely-does-not-exist");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Unauthorized",
    });
  });
});
