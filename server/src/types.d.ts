import type { User } from "@lms/shared";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
