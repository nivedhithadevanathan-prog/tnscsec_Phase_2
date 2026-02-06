import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()
export const Form5Service = {
  /* =========================================================
     1️⃣ GET Eligible Societies (before submit)
     ========================================================= */
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
  society_name: soc.society_name,

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

  /* =========================================================
     2️⃣ POST Submit Form5 (First submit)
     ========================================================= */
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
      if (!m.category_type) continue; // category optional in DB

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
          `Limit exceeded for ${m.category_type} in ${soc.society_name}`
        );
      }
    }

    await prisma.form5.createMany({
      data: members,
      skipDuplicates: true,
    });

    return { success: true, count: members.length };
  },

  /* =========================================================
     3️⃣ GET Form5 LIST (Read-only review)
     ========================================================= */
  async getForm5ListByUser(uid: number) {
    const form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form4) return { form4: null, societies: [] };

    const filedSocieties =
      await prisma.form4_filed_soc_mem_count.findMany({
        where: { form4_id: form4.id },
        orderBy: { id: "asc" },
      });

    const filedSocIds = filedSocieties.map((s) => s.id);

    const members = await prisma.form5.findMany({
      where: {
        form4_filed_soc_id: { in: filedSocIds },
        is_active: true,
      },
      orderBy: { created_at: "asc" },
    });

    const map = new Map<number, any>();

    for (const soc of filedSocieties) {
      map.set(soc.id, {
        filed_soc_id: soc.id,
        society_id: soc.society_id,
        society_name: soc.society_name,
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

      soc.members[m.category_type].push({
        id: m.id,
        member_name: m.member_name,
        aadhar_no: m.aadhar_no,
      });
    }

    return {
      form4: {
        id: form4.id,
        district_name: form4.district_name,
        zone_name: form4.zone_name,
        selected_soc_count: form4.selected_soc_count,
        filed_count: form4.filed_count,
        unfiled_count: form4.unfiled_count,
      },
      societies: Array.from(map.values()),
    };
  },

  /* =========================================================
     4️⃣ GET Editable Form5 (Prefill for edit)
     ========================================================= */
  async getEditableForm5(uid: number) {
    // Same logic as list, but minimal metadata
    return this.getForm5ListByUser(uid);
  },

  /* =========================================================
     5️⃣ PUT Edit Form5 (Edit & submit again)
     ========================================================= */
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

    // Soft-disable old rows
    await prisma.form5.updateMany({
      where: {
        form4_filed_soc_id: { in: filedSocIds },
        is_active: true,
      },
      data: { is_active: false },
    });

    // Insert new rows
    await prisma.form5.createMany({
      data: members,
      skipDuplicates: true,
    });

    return { success: true, count: members.length };
  },
};
