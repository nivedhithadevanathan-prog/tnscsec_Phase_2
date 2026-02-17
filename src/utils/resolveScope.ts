import { Request } from "express";

export interface ScopeResult {
  uid: number;    
  departmentId: number;
  districtId?: number;
  zoneId?: number;
  isAdmin: boolean;
}

export const resolveScope = (req: Request): ScopeResult => {
  const user = (req as any).user;

  if (!user?.uid) {
    throw new Error("Unauthorized");
  }

  const uid = Number(user.uid); // 🔥 FORCE NUMBER

  const role = user.role;

  //  ADMIN FLOW
  if (role === 1) {
    const departmentId = req.query.department_id
      ? Number(req.query.department_id)
      : null;

    if (!departmentId) {
      throw new Error("department_id is required for admin");
    }

    const districtId = req.query.district_id
      ? Number(req.query.district_id)
      : undefined;

    const zoneId = req.query.zone_id
      ? Number(req.query.zone_id)
      : undefined;

   return {
  uid, // ✅ add this
  departmentId,
  districtId,
  zoneId,
  isAdmin: true,
};

  }

  //  NORMAL USER FLOW
  return {
  uid, // ✅ add this
  departmentId: user.departmentId,
  districtId: user.districtId,
  zoneId: user.zoneId,
  isAdmin: false,
};

};