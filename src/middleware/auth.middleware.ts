import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Authorization header missing",
      error: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = decoded.data ?? decoded;

    if (!user?.uid && !user?.id) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: null,
      });
    }

    req.user = {
      uid: user.uid ?? user.id,
      district_id: user.district_id ?? user.districtId ?? null,
      role: user.role ?? null,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired token",
      error: null,
    });
  }
};

