import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeEvent(headers: Record<string, string> = {}) {
  return {
    req: {
      headers: new Headers(headers),
    },
  } as any;
}

describe("getUserId", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns DEV_USER_ID when set", async () => {
    process.env.DEV_USER_ID = "local-dev-user";
    const { getUserId } = await import("../../../utils/auth");

    const event = makeEvent();
    const result = await getUserId(event);
    expect(result).toBe("local-dev-user");
  });

  it("throws 401 when no DEV_USER_ID and no Authorization header", async () => {
    delete process.env.DEV_USER_ID;
    process.env.COGNITO_USER_POOL_ID = "ap-northeast-1_test";

    const { getUserId } = await import("../../../utils/auth");
    const event = makeEvent();

    await expect(getUserId(event)).rejects.toMatchObject({
      statusCode: 401,
      message: "Missing or invalid Authorization header",
    });
  });

  it("throws 401 when Authorization header does not start with Bearer", async () => {
    delete process.env.DEV_USER_ID;
    process.env.COGNITO_USER_POOL_ID = "ap-northeast-1_test";

    const { getUserId } = await import("../../../utils/auth");
    const event = makeEvent({ authorization: "Basic abc123" });

    await expect(getUserId(event)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
