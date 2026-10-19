import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'asi-challan-generator-super-secure-jwt-key-2026';
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export interface AuthSession {
  userId: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export async function createSession(sessionData: AuthSession) {
  const token = await new SignJWT({ ...sessionData })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  const cookieStore = cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as 'ADMIN' | 'USER',
    };
  } catch (err) {
    return null;
  }
}

export async function removeSession() {
  const cookieStore = cookies();
  cookieStore.delete('auth_token');
}
