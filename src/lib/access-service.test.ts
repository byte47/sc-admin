import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAccess } from "./access-service";
import { isBlocked, isAllowed, addToQueue, logAccess } from "./data";
import { BLACKLISTED_NAME_WORDS, slugify } from "./utils";

// Mock dependencies
vi.mock("./data", () => ({
  isBlocked: vi.fn(),
  isAllowed: vi.fn(),
  addToQueue: vi.fn(),
  logAccess: vi.fn(),
}));

describe("Access Service", () => {
  beforeEach(() => {
    // Reset mock state
    vi.resetAllMocks();

    // Default mock behavior
    (isBlocked as any).mockReturnValue(false);
    (isAllowed as any).mockReturnValue(false);
  });

  it("should block invalid inputs", async () => {
    const result = await checkAccess("");
    expect(result.result).toBe("block");
    expect(result.reason).toContain("Invalid");
  });

  it("should block names containing blacklisted words", async () => {
    // Use a real blacklisted word from the constants
    const name = `Test user with ${BLACKLISTED_NAME_WORDS[0]} in name`;

    const result = await checkAccess(name);

    expect(result.result).toBe("block");
    expect(result.reason).toContain("blacklisted word");
    expect(logAccess).toHaveBeenCalledWith(
      name,
      slugify(name),
      "block",
      expect.stringContaining("blacklisted word")
    );
  });

  it("should block names in the blocked list", async () => {
    const name = "Blocked User";
    (isBlocked as any).mockReturnValue(true);

    const result = await checkAccess(name);

    expect(result.result).toBe("block");
    expect(result.reason).toContain("blocked list");
    expect(logAccess).toHaveBeenCalledWith(
      name,
      slugify(name),
      "block",
      expect.stringContaining("blocked list")
    );
  });

  it("should allow names in the allowed list", async () => {
    const name = "Allowed User";
    (isAllowed as any).mockReturnValue(true);

    const result = await checkAccess(name);

    expect(result.result).toBe("allow");
    expect(logAccess).toHaveBeenCalledWith(name, slugify(name), "allow");
  });

  it("should allow by default and add to queue", async () => {
    const name = "New User";

    const result = await checkAccess(name);

    expect(result.result).toBe("allow");
    expect(addToQueue).toHaveBeenCalledWith(name, slugify(name));
    expect(logAccess).toHaveBeenCalledWith(
      name,
      slugify(name),
      "allow",
      expect.stringContaining("verification queue")
    );
  });
});
