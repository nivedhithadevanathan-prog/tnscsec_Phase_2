import { PrismaClient } from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";
import { ScopeResult } from "../../../utils/resolveScope";

export const prisma = new PrismaClient();

export const Form5Service = {

  /*GET Eligible Societies*/
  async getEligibleSocietiesByUser(uid: number) {
    const form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form4) return [];

    const filedSocieties =
      await prisma.form4_filed_soc_mem_count.findMany({
        where: { form4_id: form4.id },
        orderBy: { id: "asc" },
      });

    return filedSocieties.map((soc) => ({
      filed_soc_id: soc.id,
      society_id: soc.society_id,
      society_name: cleanText(soc.society_name),

      declared: {
        sc_st: soc.declared_sc_st,
        women: soc.declared_women,
        general: soc.declared_general,
      },

      declared_dlg: {
        sc_st_dlg: soc.declared_sc_st_dlg,
        women_dlg: soc.declared_women_dlg,
        general_dlg: soc.declared_general_dlg,
      },

      rural: {
        sc_st: soc.rural_sc_st,
        women: soc.rural_women,
        general: soc.rural_general,
      },

      rural_dlg: {
        sc_st_dlg: soc.rural_sc_st_dlg,
        women_dlg: soc.rural_women_dlg,
        general_dlg: soc.rural_general_dlg,
      },
    }));
  },

  /*POST Submit Form5*/
  async submitMembers(payload: any) {
    const { uid, members } = payload;

    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("Members array is required");
    }

    const form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });
    if (!form4) throw new Error("Form4 not found");

    const filedSocIds = [...new Set(members.map((m) => m.form4_filed_soc_id))];

    const filedSocieties =
      await prisma.form4_filed_soc_mem_count.findMany({
        where: {
          id: { in: filedSocIds },
          form4_id: form4.id,
        },
      });

    const filedSocMap = new Map<number, any>();
    filedSocieties.forEach((s) => filedSocMap.set(s.id, s));

    const countMap = new Map<string, number>();

    for (const m of members) {
      if (!m.category_type) continue;

      const soc = filedSocMap.get(m.form4_filed_soc_id);
      if (!soc) {
        throw new Error(`Invalid filed society ${m.form4_filed_soc_id}`);
      }

      const key = `${m.form4_filed_soc_id}_${m.category_type}`;
      countMap.set(key, (countMap.get(key) || 0) + 1);

      let limit = Infinity;

      if (m.category_type === "sc_st") limit = soc.declared_sc_st;
      else if (m.category_type === "women") limit = soc.declared_women;
      else if (m.category_type === "general") limit = soc.declared_general;
      else if (m.category_type === "sc_st_dlg") limit = soc.sc_st_dlg;
      else if (m.category_type === "women_dlg") limit = soc.women_dlg;
      else if (m.category_type === "general_dlg") limit = soc.general_dlg;

      if (countMap.get(key)! > limit) {
        throw new Error(
          `Limit exceeded for ${m.category_type} in ${cleanText(soc.society_name)}`
        );
      }
    }

    await prisma.form5.createMany({
      data: members.map((m) => ({
        ...m,
        member_name: cleanText(m.member_name),
        aadhar_no: cleanText(m.aadhar_no),
      })),
      skipDuplicates: true,
    });

    return { success: true, count: members.length };
  },
/* GET Form5 LIST */
async getForm5ListByUser(scope: ScopeResult) {
  const { uid, departmentId, districtId, zoneId, isAdmin } = scope;

  let form4;

  // 🔹 ADMIN FLOW
  if (isAdmin) {
    form4 = await prisma.form4.findFirst({
      where: {
        department_id: departmentId,
        ...(districtId ? { district_id: districtId } : {}),
        ...(zoneId ? { zone_id: zoneId } : {}),
      },
      orderBy: { created_at: "desc" },
    });
  }

  // 🔹 NORMAL USER FLOW
  else {
    if (!uid) {
      throw new Error("User id missing in scope");
    }

    form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });
  }

  if (!form4) {
    return { form4: null, societies: [] };
  }

  // 🔹 Get filed societies of latest form4
  const filedSocieties =
    await prisma.form4_filed_soc_mem_count.findMany({
      where: { form4_id: form4.id },
      orderBy: { id: "asc" },
    });

  const filedSocIds = filedSocieties.map((s) => s.id);

  if (filedSocIds.length === 0) {
    return {
      form4: {
        id: form4.id,
        district_name: cleanText(form4.district_name),
        zone_name: cleanText(form4.zone_name),
        selected_soc_count: form4.selected_soc_count,
        filed_count: form4.filed_count,
        unfiled_count: form4.unfiled_count,
      },
      societies: [],
    };
  }

  // 🔹 Get active members
  const members = await prisma.form5.findMany({
    where: {
      form4_filed_soc_id: { in: filedSocIds },
      is_active: true,
    },
    orderBy: { created_at: "asc" },
  });

  // 🔹 Prepare map
  const map = new Map<number, any>();

  for (const soc of filedSocieties) {
    map.set(soc.id, {
      filed_soc_id: soc.id,
      society_id: soc.society_id,
      society_name: cleanText(soc.society_name),
      declared: {
        sc_st: soc.declared_sc_st,
        women: soc.declared_women,
        general: soc.declared_general,
      },
      members: {
        sc_st: [],
        women: [],
        general: [],
        sc_st_dlg: [],
        women_dlg: [],
        general_dlg: [],
      },
    });
  }

  // 🔹 Group members safely
  for (const m of members) {
    if (!m.category_type) continue;

    const soc = map.get(m.form4_filed_soc_id);
    if (!soc) continue;

    const key = String(m.category_type).toLowerCase().trim();

    if (!soc.members[key]) continue; // safety check

    soc.members[key].push({
      id: m.id,
      member_name: cleanText(m.member_name),
      aadhar_no: cleanText(m.aadhar_no),
    });
  }

  return {
    form4: {
      id: form4.id,
      district_name: cleanText(form4.district_name),
      zone_name: cleanText(form4.zone_name),
      selected_soc_count: form4.selected_soc_count,
      filed_count: form4.filed_count,
      unfiled_count: form4.unfiled_count,
    },
    societies: Array.from(map.values()),
  };
},

 async getEditableForm5(uid: number) {

  const form4 = await prisma.form4.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  if (!form4) return { form4: null, societies: [] };

  // rest of your original editable logic here
},

/*PUT Edit Form5*/
async editForm5(payload: any) {
  const { uid, members } = payload;

  if (!Array.isArray(members) || members.length === 0) {
    throw new Error("Members array is required");
  }

  const form4 = await prisma.form4.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  if (!form4) throw new Error("Form4 not found");

  const filedSocieties =
    await prisma.form4_filed_soc_mem_count.findMany({
      where: { form4_id: form4.id },
    });

  const filedSocIds = filedSocieties.map((s) => s.id);

  // // 🔒 SAFETY CHECK — Ensure incoming members belong to latest form4
  // for (const m of members) {
  //   if (!filedSocIds.includes(m.form4_filed_soc_id)) {
  //     throw new Error(
  //       `Invalid form4_filed_soc_id: ${m.form4_filed_soc_id}`
  //     );
  //   }
  // }

  // deactivate old members of latest form4
  await prisma.form5.updateMany({
    where: {
      form4_filed_soc_id: { in: filedSocIds },
      is_active: true,
    },
    data: { is_active: false },
  });

await prisma.form5.createMany({
  data: members.map((m) => {
    if (!m.member_name || !m.aadhar_no) {
      throw new Error("member_name and aadhar_no are required");
    }

    return {
      form4_filed_soc_id: Number(m.form4_filed_soc_id),
      category_type: m.category_type as any,
     member_name: String(cleanText(String(m.member_name))),
     aadhar_no: String(cleanText(String(m.aadhar_no))),
      is_active: true,
    };
  }),
});

  return { success: true, count: members.length };
}
};