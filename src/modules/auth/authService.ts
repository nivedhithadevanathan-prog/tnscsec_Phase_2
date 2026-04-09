import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../utils/response/generateToken";

const prisma = new PrismaClient();

function cleanText(text: string | null | undefined): string | null {
  if (!text) return null;   
  return text.replace(/[\r\n]+/g, " ").trim();
}

export const AuthService = {
  async login(username: string, password: string) {

    const user = await prisma.users.findFirst({
      where: {
        username: cleanText(username) ?? null
      },
    });

    if (!user) return null;

    if (!user?.password) return null;

    if (cleanText(password) !== cleanText(user.password)) return null;

    // Fetch Names
    const district = user.district_id
      ? await prisma.district.findFirst({
          where: { id: user.district_id },
        })
      : null;

    const department = user.department_id
      ? await prisma.department.findFirst({
          where: { id: user.department_id },
        })
      : null;

    // FIXED ZONE HANDLING
   let zoneNames: string[] = [];

if (user.zone_id) {
  try {
    // extract numbers safely (no JSON.parse)
    const zoneIds = user.zone_id
      .match(/\d+/g)
      ?.map(Number) || [];

    console.log("ZONE IDS:", zoneIds);

    if (zoneIds.length > 0) {
      const zones = await prisma.zone.findMany({
        where: {
          id: { in: zoneIds },
        },
      });

      console.log("ZONES FOUND:", zones);

      zoneNames = zones
        .map((z) => (z.name ? z.name.trim() : null))
        .filter((name): name is string => !!name);
    }

  } catch (err) {
    console.log("Zone error:", err);
  }
}


    const accessToken = generateToken(user);

    // Compute admin flag
    const is_admin = user.role_id === 1;

    return {
      login: "success",
      username: user.username,
      user_id: user.id,
      fullname: user.fullname,

      // Added fields
      role_id: user.role_id,
      is_admin,
      is_active: user.is_active,

      department_id: user.department_id,
      district_id: user.district_id,
      zone_id: user.zone_id,

      department_name: cleanText(department?.name) || null,
      district_name: cleanText(district?.name) || null,
      zone_name: zoneNames.length > 0 ? zoneNames : null,

      accessToken,
    };
  },
};