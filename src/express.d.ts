declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        outside_id: string;
        role: string;
        status: string;
      };
    }
  }
}

export {};
