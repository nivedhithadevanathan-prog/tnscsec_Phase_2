import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      // add more later if needed
      role?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
