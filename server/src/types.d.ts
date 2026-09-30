import type { User } from "./schemas.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
