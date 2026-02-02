import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../utils/response/generateToken";

const prisma = new PrismaClient();

function cleanText(text: string | null | undefined) {
  if (!text) return text;
  return text.replace(/[\r\n]+/g, " ").trim();
}


export const AuthService = {
  async login(username: string, password: string) {
    const user = await prisma.users.findFirst({
      where: { username },
    });

    if (!user) return null;
    if (password !== user.password) return null;

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

    const zone = user.zone_id
      ? await prisma.zone.findFirst({
          where: { id: Number(user.zone_id) }, // zone_id is string
        })
      : null;

    const accessToken = generateToken(user);

    return {
      login: "success",
      username: user.username,
      user_id: user.id,
      fullname: user.fullname,
      // email: user.email,

      // IDs
      department_id: user.department_id,
      district_id: user.district_id,
      zone_id: user.zone_id,

      // Names (new)
      department_name: cleanText(department?.name) || null,
      district_name: cleanText(district?.name) || null,
      zone_name: cleanText(zone?.name) || null,

      accessToken,
    };
  },
};
