import { PrismaClient } from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";

export const prisma = new PrismaClient();

/*Election status helper*/
type ElectionStatus = "QUALIFIED" | "UNOPPOSED" | "UNQUALIFIED";

function evaluateElectionStatus(
  rural: { sc_st: number; women: number; general: number },
  declared: { sc_st: number; women: number; general: number }
): ElectionStatus {
  const diffs = [
    declared.sc_st - rural.sc_st,
    declared.women - rural.women,
    declared.general - rural.general,
  ];

  const hasHigher = diffs.some(d => d > 0);
  const allEqual = diffs.every(d => d === 0);

  if (hasHigher) return "QUALIFIED";
  if (allEqual) return "UNOPPOSED";
  return "UNQUALIFIED";
}

/*Form4 Service*/
export const Form4Service = {

  /*Load Form4 base data*/
  async loadForm4(uid: number) {
    const userMeta = await prisma.users.findFirst({
      where: { id: uid },
      select: {
        id: true,
        department_id: true,
        district_id: true,
        zone_id: true,
        fullname: true,
      },
    });

    if (!userMeta) {
      return { userMeta: null, selectedSocList: [] };
    }

    if (userMeta.fullname) {
      userMeta.fullname = cleanText(userMeta.fullname);
    }

    const zoneId = userMeta.zone_id
      ? Number(userMeta.zone_id)
      : undefined;

    const form2Ids = (
      await prisma.form2.findMany({
        where: {
          department_id: userMeta.department_id ?? undefined,
          district_id: userMeta.district_id ?? undefined,
          ...(zoneId ? { zone_id: zoneId } : {}),
        },
        select: { id: true },
      })
    ).map(f => f.id);

    if (!form2Ids.length) {
      return { userMeta, selectedSocList: [] };
    }

    let selectedSocList = await prisma.form2_selected_soc.findMany({
      where: { form2_id: { in: form2Ids } },
      orderBy: { society_name: "asc" },
    });

    if (!selectedSocList.length) {
      return { userMeta, selectedSocList: [] };
    }

    selectedSocList = selectedSocList.map(soc => ({
      ...soc,
      society_name: cleanText(soc.society_name),
    }));

    const societyIds = selectedSocList
      .map(s => Number(s.society_id))
      .filter(id => !isNaN(id));

    const reservationRows = await prisma.reservation.findMany({
      where: { rurel_id: { in: societyIds } },
      select: {
        rurel_id: true,
        sc_st: true,
        women: true,
        general: true,
        sc_st_dlg: true,
        women_dlg: true,
        general_dlg: true,
        tot_voters: true,
      },
    });

    const reservationMap: Record<number, any> = {};
    reservationRows.forEach(r => {
      reservationMap[Number(r.rurel_id)] = r;
    });

    selectedSocList = selectedSocList.map(soc => {
      const rural = reservationMap[Number(soc.society_id)] ?? {};

      const rural_sc_st = Number(rural.sc_st ?? 0);
      const rural_women = Number(rural.women ?? 0);
      const rural_general = Number(rural.general ?? 0);

      // ✅ DLG FROM RESERVATION
      const rural_sc_st_dlg = Number(rural.sc_st_dlg ?? 0);
      const rural_women_dlg = Number(rural.women_dlg ?? 0);
      const rural_general_dlg = Number(rural.general_dlg ?? 0);

      return {
        ...soc,
        selected: false,
        rural_id: rural.rurel_id ?? soc.society_id,

        rural_sc_st,
        rural_women,
        rural_general,

        // ✅ added
        rural_sc_st_dlg,
        rural_women_dlg,
        rural_general_dlg,

        rural_tot_voters:
          rural.tot_voters ??
          rural_sc_st + rural_women + rural_general,
      };
    });

    return { userMeta, selectedSocList };
  },

  /*Checkbox preview*/
  async getCheckboxPreview(uid: number, selectedIds: number[]) {
    const { selectedSocList } = await this.loadForm4(uid);

    return {
      filed: selectedSocList.filter(s => selectedIds.includes(s.society_id)),
      unfiled: selectedSocList.filter(s => !selectedIds.includes(s.society_id)),
    };
  },

  /*Submit Form4*/
  async submitForm4(payload: any) {
    const {
      uid,
      form4_id,
      department_id,
      district_id,
      district_name,
      zone_id,
      zone_name,
      form1_selected_list,
    } = payload;

    const filedArr: any[] = [];
    const unfiledArr: any[] = [];

    for (const item of form1_selected_list) {

      if (!item.selected) {
        unfiledArr.push({
          society_id: item.society_id,
          society_name: cleanText(item.society_name),
          rural_id: item.rural_id,
          sc_st: item.sc_st ?? 0,
          women: item.women ?? 0,
          general: item.general ?? 0,
          sc_st_dlg: item.sc_st_dlg ?? 0,
          women_dlg: item.women_dlg ?? 0,
          general_dlg: item.general_dlg ?? 0,
          tot_voters:
            Number(item.sc_st ?? 0) +
            Number(item.women ?? 0) +
            Number(item.general ?? 0),
          remarks: cleanText(item.remarks) ?? null,
        });
        continue;
      }

      const rural_sc_st = Number(item.rural_sc_st ?? 0);
      const rural_women = Number(item.rural_women ?? 0);
      const rural_general = Number(item.rural_general ?? 0);

      const declared_sc_st = Number(item.declared_sc_st ?? 0);
      const declared_women = Number(item.declared_women ?? 0);
      const declared_general = Number(item.declared_general ?? 0);

      const election_status = evaluateElectionStatus(
        { sc_st: rural_sc_st, women: rural_women, general: rural_general },
        { sc_st: declared_sc_st, women: declared_women, general: declared_general }
      );

      filedArr.push({
        society_id: item.society_id,
        society_name: cleanText(item.society_name),
        rural_id: item.rural_id,
        rural_sc_st,
        rural_women,
        rural_general,
        rural_tot_voters:
          rural_sc_st + rural_women + rural_general,

        // ✅ rural dlg from reservation
        rural_sc_st_dlg: item.rural_sc_st_dlg ?? 0,
        rural_women_dlg: item.rural_women_dlg ?? 0,
        rural_general_dlg: item.rural_general_dlg ?? 0,

        declared_sc_st,
        declared_women,
        declared_general,
        declared_tot_voters:
          declared_sc_st + declared_women + declared_general,

        declared_sc_st_dlg: item.declared_sc_st_dlg ?? 0,
        declared_women_dlg: item.declared_women_dlg ?? 0,
        declared_general_dlg: item.declared_general_dlg ?? 0,

        election_status,
        remarks: cleanText(item.remarks) ?? null,
      });
    }

    const selectedCount = form1_selected_list.length;

    if (form4_id) {
      await prisma.form4.update({
        where: { id: Number(form4_id) },
        data: {
          department_id,
          district_id,
          district_name: cleanText(district_name),
          zone_id,
          zone_name: cleanText(zone_name),
          selected_soc_count: selectedCount,
          filed_count: filedArr.length,
          unfiled_count: unfiledArr.length,
        },
      });

      await prisma.form4_filed_soc_mem_count.deleteMany({
        where: { form4_id: Number(form4_id) },
      });

      await prisma.form4_unfiled_soc_mem_count.deleteMany({
        where: { form4_id: Number(form4_id) },
      });

      if (filedArr.length) {
        await prisma.form4_filed_soc_mem_count.createMany({
          data: filedArr.map(r => ({ ...r, form4_id: Number(form4_id) })),
        });
      }

      if (unfiledArr.length) {
        await prisma.form4_unfiled_soc_mem_count.createMany({
          data: unfiledArr.map(r => ({ ...r, form4_id: Number(form4_id) })),
        });
      }

      return { form4_id };
    }

    const newForm4 = await prisma.form4.create({
      data: {
        uid,
        department_id,
        district_id,
        district_name: cleanText(district_name),
        zone_id,
        zone_name: cleanText(zone_name),
        selected_soc_count: selectedCount,
        filed_count: filedArr.length,
        unfiled_count: unfiledArr.length,
      },
    });

    if (filedArr.length) {
      await prisma.form4_filed_soc_mem_count.createMany({
        data: filedArr.map(r => ({ ...r, form4_id: newForm4.id })),
      });
    }

    if (unfiledArr.length) {
      await prisma.form4_unfiled_soc_mem_count.createMany({
        data: unfiledArr.map(r => ({ ...r, form4_id: newForm4.id })),
      });
    }

    return { form4_id: newForm4.id };
  },

  /*Edit Form4*/
  async editForm4(payload: any) {
    const { uid, form4_id } = payload;

    if (!form4_id) throw new Error("form4_id is required for edit");

    const form4 = await prisma.form4.findUnique({
      where: { id: Number(form4_id) },
    });

    if (!form4) throw new Error("Form4 not found");
    if (form4.uid !== uid) throw new Error("Unauthorized");

    const form5Exists = await prisma.form5.findFirst({
      where: {
        form4_filed_soc_mem_count: { form4_id: form4.id },
      },
    });

    if (form5Exists) {
      const err: any = new Error("Moved to Form5. Editing not allowed.");
      err.statusCode = 409;
      throw err;
    }

    return this.submitForm4(payload);
  },

  /*Get Form4 details*/
  async getForm4Details(form4_id: number) {
    const form4 = await prisma.form4.findUnique({
      where: { id: form4_id },
    });

    if (!form4) return null;

    return {
      form4,
      filedList: await prisma.form4_filed_soc_mem_count.findMany({
        where: { form4_id },
      }),
      unfiledList: await prisma.form4_unfiled_soc_mem_count.findMany({
        where: { form4_id },
      }),
    };
  },

  /*List Form4*/
  async getForm4ListByUser(params: {
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

    let where: any = {};

    if (role === 1) {
    } else if (role === 4) {
      where.zone_id = { in: zoneIds };
    } else {
      where.uid = uid;
    }

    const form4List = await prisma.form4.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const result = [];

    for (const form4 of form4List) {
      result.push({
        form4,
        filedList: await prisma.form4_filed_soc_mem_count.findMany({
          where: { form4_id: form4.id },
        }),
        unfiledList: await prisma.form4_unfiled_soc_mem_count.findMany({
          where: { form4_id: form4.id },
        }),
      });
    }

    return result;
  },

  /*Editable Form4*/
  async getEditableForm4(uid: number) {
    const form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form4) return null;

    const filedList = await prisma.form4_filed_soc_mem_count.findMany({
      where: { form4_id: form4.id },
    });

    const unfiledList = await prisma.form4_unfiled_soc_mem_count.findMany({
      where: { form4_id: form4.id },
    });

    return {
      form4,
      societies: [
        ...filedList.map(s => ({ ...s, selected: true })),
        ...unfiledList.map(s => ({ ...s, selected: false })),
      ],
    };
  },
/*PDF DOWNLOAD*/
async getForm4Pdf(payload: any) {

  const { uid, role, zone_id } = payload;

  let zoneIds: number[] = [];

  if (zone_id) {
    try {
      zoneIds = JSON.parse(zone_id);
    } catch {}
  }

  let where: any = {};

  if (role === 1) {
    // admin → all
  } else if (role === 4) {
    where.zone_id = { in: zoneIds };
  } else {
    where.uid = uid;
  }

  const form4List = await prisma.form4.findMany({
    where,
    orderBy: { created_at: "desc" },
  });

  const result = [];

  for (const form4 of form4List) {
    result.push({
      form4,
      filedList: await prisma.form4_filed_soc_mem_count.findMany({
        where: { form4_id: form4.id },
      }),
      unfiledList: await prisma.form4_unfiled_soc_mem_count.findMany({
        where: { form4_id: form4.id },
      }),
    });
  }

  return result;
},
};