import { defineEventHandler, getRequestURL } from "h3";
import { getUserId } from "../utils/auth";

const PUBLIC_PATHS = ["/health", "/_nitro"];

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;

  // 公開エンドポイントはスキップ
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return;
  }

  // OPTIONS リクエストはスキップ (CORS preflight)
  if (event.method === "OPTIONS") {
    return;
  }

  // API ルート以外はスキップ
  if (!pathname.startsWith("/api/")) {
    return;
  }

  const userId = await getUserId(event);
  event.context.userId = userId;
});
