import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

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

    console.log("✅ DECODED TOKEN:", decoded);

    const user = decoded.data ?? decoded;

    if (!user?.uid && !user?.id) {
      console.log("❌ Invalid token payload:", user);
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: null,
      });
    }

    req.user = {
      uid: user.uid ?? user.id,
      departmentId: user.departmentId ?? user.department_id ?? null,
      districtId: user.districtId ?? user.district_id ?? null,
      zoneId: user.zoneId ?? user.zone_id ?? null,
      role: user.role ?? null,
    };

    console.log("👤 FINAL req.user:", req.user);

    next();
  } catch (err) {
    console.log("❌ JWT ERROR:", err);
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired token",
      error: null,
    });
  }
};
