import { createRemoteJWKSet, jwtVerify } from "jose";
import { createError, getHeader, H3Event } from "h3";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const region = process.env.AWS_REGION || "ap-northeast-1";
    if (!userPoolId) {
      throw createError({ statusCode: 500, message: "COGNITO_USER_POOL_ID not configured" });
    }
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  }
  return jwks;
}

export async function getUserId(event: H3Event): Promise<string> {
  // ローカル開発: DEV_USER_ID があればそのまま返す
  const devUserId = process.env.DEV_USER_ID;
  if (devUserId) {
    return devUserId;
  }

  // 本番: Authorization header から JWT を検証
  const authHeader = getHeader(event, "authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7);
  const region = process.env.AWS_REGION || "ap-northeast-1";
  const userPoolId = process.env.COGNITO_USER_POOL_ID!;
  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer,
      algorithms: ["RS256"],
    });
    if (!payload.sub) {
      throw createError({ statusCode: 401, message: "Token missing sub claim" });
    }
    return payload.sub;
  } catch (err) {
    if ((err as any).statusCode === 401) throw err;
    throw createError({ statusCode: 401, message: "Invalid token" });
  }
}
