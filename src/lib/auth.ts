import { SignJWT, jwtVerify } from 'jose';

function getSecret() {
  const secret = process.env.JWT_SECRET || 'change-me-in-production-roshni-2026';
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: { userId: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}
