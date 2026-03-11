import { PrismaClient } from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";

export const prisma = new PrismaClient();

export const Form5BService = {

  /*GET Form5B Preview*/
  async getPreview(uid: number) {

    const form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form4) {
      return { form4: null, societies: [] };
    }

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
        },
        societies: [],
      };
    }

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
        society_name: cleanText(soc.society_name),
        is_stopped: soc.is_stopped,
        members: [],
      });
    }

    for (const m of members) {

      const soc = map.get(m.form4_filed_soc_id);
      if (!soc) continue;

      soc.members.push({
        id: m.id,
        member_name: cleanText(m.member_name),
        aadhar_no: cleanText(m.aadhar_no),
        category_type: m.category_type,
      });

    }

    return {
      form4: {
        id: form4.id,
        district_name: cleanText(form4.district_name),
        zone_name: cleanText(form4.zone_name),
      },
      societies: Array.from(map.values()),
    };

  },

  /*POST Stop Societies*/
async stopSocieties(payload: any) {

  const { uid, societies } = payload;

  if (!Array.isArray(societies) || societies.length === 0) {
    throw new Error("Societies array is required");
  }

  const form4 = await prisma.form4.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  if (!form4) {
    throw new Error("Form4 not found");
  }

  const filedSocIds = societies.map((s: any) => s.filed_soc_id);

  const filedSocieties =
    await prisma.form4_filed_soc_mem_count.findMany({
      where: {
        id: { in: filedSocIds },
        form4_id: form4.id,
      },
    });

  if (filedSocieties.length !== filedSocIds.length) {
    throw new Error("Invalid societies selected");
  }

  for (const soc of societies) {

    await prisma.form4_filed_soc_mem_count.update({
      where: { id: soc.filed_soc_id },
      data: {
        is_stopped: true,
        stopped_at: new Date(),
        stopped_by: uid,
        stop_remark: soc.stop_remark,
        decision_at: new Date(),
      },
    });

    await prisma.form5.updateMany({
      where: {
        form4_filed_soc_id: soc.filed_soc_id,
        is_active: true,
      },
      data: {
        is_active: false,
      },
    });

  }

  return {
    success: true,
    stopped_societies: societies.length,
  };
},

/*POST Stop Candidates*/
async stopCandidates(payload: any) {

  const { candidates } = payload;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("Candidates array is required");
  }

  const candidateIds = candidates.map((c: any) => c.candidate_id);

  return await prisma.$transaction(async (tx) => {

    const candidateRecords = await tx.form5.findMany({
      where: {
        id: { in: candidateIds }
      },
      include: {
        form4_filed_soc_mem_count: true
      }
    });

    if (candidateRecords.length !== candidateIds.length) {
      throw new Error("Invalid candidates selected");
    }

    for (const candidate of candidateRecords) {

      if (candidate.form4_filed_soc_mem_count?.is_stopped) {
        throw new Error(
          `Society already stopped for candidate ${candidate.member_name}`
        );
      }

    }

    const updated = await tx.form5.updateMany({
      where: {
        id: { in: candidateIds },
        is_active: true
      },
      data: {
        is_active: false
      }
    });

    return {
      success: true,
      stopped_candidates: updated.count
    };

  });

},

/*POST Submit Form5B*/
async submitForm5B(uid: number) {

  const form4 = await prisma.form4.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  if (!form4) {
    throw new Error("Form4 not found");
  }

  const societies = await prisma.form4_filed_soc_mem_count.findMany({
    where: { form4_id: form4.id },
  });

  if (!societies || societies.length === 0) {
    throw new Error("No filed societies found");
  }

  const total_societies = societies.length;

  const stopped_societies = societies.filter(
    (s) => s.is_stopped === true
  ).length;

  const active_societies = total_societies - stopped_societies;

  return {
    success: true,
    form4_id: form4.id,
    total_societies,
    stopped_societies,
    active_societies,
  };

},

/*GET Form5B LIST*/
async getForm5BListByUser(params: { uid: number; role: number }) {

  const { uid, role } = params;

  let form4;

  // 🔹 ADMIN → get latest Form4 overall
  if (role === 1) {
    form4 = await prisma.form4.findFirst({
      orderBy: { created_at: "desc" },
    });
  }

  // 🔹 NORMAL USER → get their latest Form4
  else {
    form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });
  }

  if (!form4) {
    return { form4: null, societies: [] };
  }

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

  const members = await prisma.form5.findMany({
    where: {
      form4_filed_soc_id: { in: filedSocIds },
    },
    orderBy: { created_at: "asc" },
  });

  const map = new Map<number, any>();

  for (const soc of filedSocieties) {
    map.set(soc.id, {
      filed_soc_id: soc.id,
      society_id: soc.society_id,
      society_name: cleanText(soc.society_name),
      is_stopped: soc.is_stopped,
      stop_remark: soc.stop_remark,
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
      is_active: m.is_active,
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

};