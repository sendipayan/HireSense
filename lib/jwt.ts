import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signJwt(payload: { userId: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
    role: string;
  };
}
