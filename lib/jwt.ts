import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

type verificationStatus = "APPROVED" | "PENDING" | "REJECTED";

export function signJwt(payload: {
  userId: string;
  role: string;
  isVerified?: verificationStatus;
}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
    role: string;
    isVerified?: verificationStatus;
  };
}
