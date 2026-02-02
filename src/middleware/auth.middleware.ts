import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;   // full user object
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  console.log('=== JWT SECRET DEBUG ===');
  console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
  console.log('Token exists:', !!token);
  
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'uthamapal12am';
  console.log('Using JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully');

    // FIXED: Pass full data into req.user
    if (decoded.data) {
      req.user = decoded.data; 
      // console.log("USER FROM TOKEN:", req.user);
      return next();
    } else {
      return res.status(401).json({ message: "Invalid token structure" });
    }

  } catch (err: any) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
