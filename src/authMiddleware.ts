import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export function authMiddleware(req: Request) {
  return withAuth(req);
}
