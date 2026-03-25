import { Request } from "express";

export interface ScopeResult {
  uid: number;              //  Always available
  departmentId: number;
  districtId?: number;
  zoneId?: number;
  isAdmin: boolean;
}

export const resolveScope = (req: Request): ScopeResult => {
  const rawUser = (req as any).user;

  //  Support BOTH uid and id from token
  const rawUid = rawUser?.uid ?? rawUser?.id;

  if (!rawUid) {
    throw new Error("User ID missing");
  }

  const uid = Number(rawUid);

  if (Number.isNaN(uid)) {
    throw new Error("Invalid user id in token");
  }

  const role = rawUser.role;

  //  ADMIN FLOW
  if (role === 1) {
    const departmentId = req.query.department_id
      ? Number(req.query.department_id)
      : null;

    if (!departmentId || Number.isNaN(departmentId)) {
      throw new Error("department_id is required for admin");
    }

    const districtId = req.query.district_id
      ? Number(req.query.district_id)
      : undefined;

    const zoneId = req.query.zone_id
      ? Number(req.query.zone_id)
      : undefined;

    return {
      uid,
      departmentId,
      districtId,
      zoneId,
      isAdmin: true,
    };
  }

  //  NORMAL USER FLOW
  return {
    uid,
    departmentId: Number(rawUser.departmentId),
    districtId: rawUser.districtId
      ? Number(rawUser.districtId)
      : undefined,
    zoneId: rawUser.zoneId
      ? Number(rawUser.zoneId)
      : undefined,
    isAdmin: false,
  };
};
