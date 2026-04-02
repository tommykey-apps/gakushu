import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dynamo before importing the handler
vi.mock("../../../utils/dynamo", () => ({
  docClient: {
    send: vi.fn(),
  },
  TABLE_NAME: "gakushu-test",
}));

import handler from "../../../routes/api/auth/me.get";
import { docClient } from "../../../utils/dynamo";

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns new user profile when no item found in DB", async () => {
    vi.mocked(docClient.send).mockResolvedValue({ Item: undefined } as any);

    const event = {
      context: { userId: "user-123" },
    } as any;

    const result = await handler(event);
    expect(result).toEqual({
      userId: "user-123",
      displayName: null,
      createdAt: expect.any(String),
    });
    expect(docClient.send).toHaveBeenCalledOnce();
  });

  it("returns existing user profile from DB", async () => {
    vi.mocked(docClient.send).mockResolvedValue({
      Item: {
        pk: "USER#user-123",
        sk: "PROFILE",
        displayName: "テストユーザー",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    } as any);

    const event = {
      context: { userId: "user-123" },
    } as any;

    const result = await handler(event);
    expect(result).toEqual({
      userId: "user-123",
      displayName: "テストユーザー",
      createdAt: "2025-01-01T00:00:00.000Z",
    });
  });

  it("returns null displayName when DB item has empty displayName", async () => {
    vi.mocked(docClient.send).mockResolvedValue({
      Item: {
        pk: "USER#user-123",
        sk: "PROFILE",
        displayName: "",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    } as any);

    const event = {
      context: { userId: "user-123" },
    } as any;

    const result = await handler(event);
    expect(result.displayName).toBeNull();
  });
});
