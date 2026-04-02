import { PrismaClient } from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";

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
/*GET Form5 LIST*/
async getForm5ListByUser(params: { 
  uid: number; 
  role: number; 
  zone_id?: string; 
}) {

  const { uid, role, zone_id } = params;

  let zoneIds: number[] = [];

  if (zone_id) {
    try {
      zoneIds = JSON.parse(zone_id);
    } catch {}
  }

  let form4List: any[] = [];

  // ADMIN - latest only
  if (role === 1) {
    const latest = await prisma.form4.findFirst({
      orderBy: { created_at: "desc" },
    });
    if (latest) form4List = [latest];
  }

  // JRCS - ALL form4 from zones
  else if (role === 4) {
    form4List = await prisma.form4.findMany({
      where: {
        zone_id: {
          in: zoneIds,
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  // NORMAL USER -latest own
  else {
    const latest = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });
    if (latest) form4List = [latest];
  }

  if (!form4List.length) {
    return [];
  }

  const finalResult: any[] = [];

  for (const form4 of form4List) {

    const filedSocieties =
      await prisma.form4_filed_soc_mem_count.findMany({
        where: { form4_id: form4.id },
        orderBy: { id: "asc" },
      });

    const filedSocIds = filedSocieties.map((s) => s.id);

    let members: any[] = [];

    if (filedSocIds.length > 0) {
      members = await prisma.form5.findMany({
        where: {
          form4_filed_soc_id: { in: filedSocIds },
          is_active: true, 
        },
        orderBy: { created_at: "asc" },
      });
    }

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

    for (const m of members) {
      if (!m.category_type) continue;

      const soc = map.get(m.form4_filed_soc_id);
      if (!soc) continue;

      const key = String(m.category_type).toLowerCase().trim();

      if (!soc.members[key]) continue;

      soc.members[key].push({
        id: m.id,
        member_name: cleanText(m.member_name),
        aadhar_no: cleanText(m.aadhar_no),
      });
    }

    finalResult.push({
      form4: {
        id: form4.id,
        district_name: cleanText(form4.district_name),
        zone_name: cleanText(form4.zone_name),
        selected_soc_count: form4.selected_soc_count,
        filed_count: form4.filed_count,
        unfiled_count: form4.unfiled_count,
      },
      societies: Array.from(map.values()),
    });
  }

  return finalResult;
},

async getEditableForm5(uid: number) {

  // Get latest form4 for user
  const form4 = await prisma.form4.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  if (!form4) {
    return { form4: null, societies: [] };
  }

  // Get filed societies
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

  //Get ALL members (including inactive for editable)
  const members = await prisma.form5.findMany({
    where: {
      form4_filed_soc_id: { in: filedSocIds },
    },
    orderBy: { created_at: "asc" },
  });

  // Map societies
  const map = new Map<number, any>();

  for (const soc of filedSocieties) {
    map.set(soc.id, {
      filed_soc_id: soc.id,
      society_id: soc.society_id,
      society_name: cleanText(soc.society_name),
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

  // Group members
  for (const m of members) {
    if (!m.category_type) continue;

    const soc = map.get(m.form4_filed_soc_id);
    if (!soc) continue;

    const key = String(m.category_type).toLowerCase().trim();

    if (!soc.members[key]) continue;

    soc.members[key].push({
      id: m.id,
      member_name: cleanText(m.member_name),
      aadhar_no: cleanText(m.aadhar_no),
      is_active: m.is_active, 
    });
  }

  //Final response
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