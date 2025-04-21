import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./data-pg";

vi.mock("./db-pg", () => ({
  default: {
    connect: vi.fn(() => ({
      query: vi.fn(),
      release: vi.fn(),
    })),
  },
}));

const mockClient = {
  query: vi.fn(),
  release: vi.fn(),
};

describe("data-pg database functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addAccessHistory inserts and returns row", async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const result = await db.addAccessHistory("n", "s", "allow", "r");
    expect(result).toEqual({ id: 1 });
    expect(mockClient.query).toHaveBeenCalled();
  });

  it("getAccessHistory returns items and total", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ count: "1" }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const result = await db.getAccessHistory(1, 10);
    expect(result.items).toEqual([{ id: 1 }]);
    expect(result.total).toBe(1);
  });

  it("addToBlockedNames inserts and returns row", async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [{ value: "foo", created_at: "2024-01-01T00:00:00Z" }],
    });
    const result = await db.addToBlockedNames("foo");
    expect(result).toEqual({
      value: "foo",
      created_at: "2024-01-01T00:00:00Z",
    });
  });

  it("getBlockedNames returns items and total", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ count: "1" }] })
      .mockResolvedValueOnce({
        rows: [{ value: "bar", created_at: "2024-01-01T00:00:00Z" }],
      });
    const result = await db.getBlockedNames(1, 10);
    expect(result.items).toEqual(["bar"]);
    expect(result.total).toBe(1);
  });

  it("removeFromBlockedNames deletes row", async () => {
    await db.removeFromBlockedNames("baz");
    expect(mockClient.query).toHaveBeenCalledWith(
      "DELETE FROM blocked_names WHERE value = $1",
      ["baz"]
    );
  });

  // Repeat for add/get/remove blocked slugs, allowed names, allowed slugs, verification queue, messages
});
