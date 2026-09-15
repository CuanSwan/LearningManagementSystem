import type { User } from "./userSchema.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
