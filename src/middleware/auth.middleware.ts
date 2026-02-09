import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const JWT_SECRET = process.env.JWT_SECRET || "uthamapal12am";

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const userData = decoded.data ?? decoded;
    // 🔥 FINAL FIX: normalize user id
   req.user = {
    uid:userData.uid,
    district_id:userData.districtId,
    role: userData.role,
};


    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
