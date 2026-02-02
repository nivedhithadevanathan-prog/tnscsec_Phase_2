import prisma from "../../shared/prisma";



type RuralDetail = {
  rural_id: number;
  sc_st: number;
  women: number;
  general: number;
  tot_voters: number;
};

type Form4InputItem = {
  society_id: number;
  society_name?: string | null;
  rural_id?: number | null;
  selected: boolean;

  declared_sc_st?: number;
  declared_women?: number;
  declared_general?: number;

  remarks?: string | null;
};


function getElectionStatus(
  rural: RuralDetail,
  declared: { sc_st: number; women: number; general: number }
): "QUALIFIED" | "UNOPPOSED" | "UNQUALIFIED" {
  const allEqual =
    declared.sc_st === rural.sc_st &&
    declared.women === rural.women &&
    declared.general === rural.general;

  const hasIncrease =
    declared.sc_st > rural.sc_st ||
    declared.women > rural.women ||
    declared.general > rural.general;

  if (allEqual) return "UNOPPOSED";
  if (hasIncrease) return "QUALIFIED";
  return "UNQUALIFIED";
}



export const Form4Service = {
 
  async loadForm4(uid: number) {
    const userMeta = await prisma.users.findFirst({
      where: { id: uid },
      select: {
        id: true,
        department_id: true,
        district_id: true,
        zone_id: true, // string?
        fullname: true,
      },
    });

    if (!userMeta) {
      return { userMeta: null, selectedSocList: [] };
    }

    
    const zoneId =
      userMeta.zone_id !== null && userMeta.zone_id !== undefined
        ? Number(userMeta.zone_id)
        : undefined;

   
    const form2Ids = (
      await prisma.form2.findMany({
        where: {
          department_id: userMeta.department_id ?? undefined,
          district_id: userMeta.district_id ?? undefined,
          zone_id: zoneId,
        },
        select: { id: true },
      })
    ).map((f) => f.id);

    if (!form2Ids.length) {
      return { userMeta, selectedSocList: [] };
    }

    
    const societies = await prisma.form2_selected_soc.findMany({
      where: { form2_id: { in: form2Ids } },
      orderBy: { society_name: "asc" },
    });

    if (!societies.length) {
      return { userMeta, selectedSocList: [] };
    }

   
    const ruralIds = societies.map((s) => Number(s.society_id));

    const reservations = await prisma.reservation.findMany({
      where: { rurel_id: { in: ruralIds } },
    });

    const ruralMap: Record<number, RuralDetail> = {};
    for (const r of reservations) {
      if (r.rurel_id !== null) {
        ruralMap[Number(r.rurel_id)] = {
          rural_id: Number(r.rurel_id),
          sc_st: Number(r.sc_st ?? 0),
          women: Number(r.women ?? 0),
          general: Number(r.general ?? 0),
          tot_voters:
            Number(r.tot_voters ?? 0) ||
            Number(r.sc_st ?? 0) +
              Number(r.women ?? 0) +
              Number(r.general ?? 0),
        };
      }
    }

    
    const selectedSocList = societies.map((s) => {
      const rural = ruralMap[Number(s.society_id)];

      return {
        society_id: s.society_id,
        society_name: s.society_name,
        rural_id: rural?.rural_id ?? s.society_id,

        sc_st: rural?.sc_st ?? 0,
        women: rural?.women ?? 0,
        general: rural?.general ?? 0,
        tot_voters: rural?.tot_voters ?? 0,

        selected: false,
        declared_sc_st: 0,
        declared_women: 0,
        declared_general: 0,
        remarks: null,
      };
    });

    return { userMeta, selectedSocList };
  },

 
  async getCheckboxPreview(uid: number, selectedIds: number[]) {
    const { selectedSocList } = await this.loadForm4(uid);

    return {
      filed: selectedSocList.filter((s) =>
        selectedIds.includes(Number(s.society_id))
      ),
      unfiled: selectedSocList.filter(
        (s) => !selectedIds.includes(Number(s.society_id))
      ),
    };
  },

 
  async submitForm4(payload: {
    uid: number;
    department_id?: number;
    district_id?: number;
    district_name?: string;
    zone_id?: number;
    zone_name?: string;
    form4_id?: number;
    form2_selected_list: Form4InputItem[];
  }) {
    const {
      uid,
      department_id,
      district_id,
      district_name,
      zone_id,
      zone_name,
      form4_id,
      form2_selected_list,
    } = payload;

    
    const ruralIds = form2_selected_list.map((i) =>
      Number(i.rural_id ?? i.society_id)
    );

    const reservations = await prisma.reservation.findMany({
      where: { rurel_id: { in: ruralIds } },
    });

    const ruralMap: Record<number, RuralDetail> = {};
    for (const r of reservations) {
      if (r.rurel_id !== null) {
        ruralMap[Number(r.rurel_id)] = {
          rural_id: Number(r.rurel_id),
          sc_st: Number(r.sc_st ?? 0),
          women: Number(r.women ?? 0),
          general: Number(r.general ?? 0),
          tot_voters:
            Number(r.tot_voters ?? 0) ||
            Number(r.sc_st ?? 0) +
              Number(r.women ?? 0) +
              Number(r.general ?? 0),
        };
      }
    }

    const filedArr: any[] = [];
    const unfiledArr: any[] = [];

    for (const item of form2_selected_list) {
      const ruralId = Number(
        item.rural_id !== null && item.rural_id !== undefined
          ? item.rural_id
          : item.society_id
      );

      const rural = ruralMap[ruralId];
      if (!rural) {
        throw new Error(`Missing rural data for society ${item.society_id}`);
      }

      if (item.selected) {
        const d_sc = Number(item.declared_sc_st ?? 0);
        const d_wo = Number(item.declared_women ?? 0);
        const d_ge = Number(item.declared_general ?? 0);

        filedArr.push({
          society_id: item.society_id,
          society_name: item.society_name,
          rural_id: rural.rural_id,

          rural_sc_st: rural.sc_st,
          rural_women: rural.women,
          rural_general: rural.general,
          rural_tot_voters: rural.tot_voters,

          declared_sc_st: d_sc,
          declared_women: d_wo,
          declared_general: d_ge,
          declared_tot_voters: d_sc + d_wo + d_ge,

          tot_voters: d_sc + d_wo + d_ge,
          election_status: getElectionStatus(rural, {
            sc_st: d_sc,
            women: d_wo,
            general: d_ge,
          }),
          remarks: item.remarks ?? null,
        });
      } else {
        unfiledArr.push({
          society_id: item.society_id,
          society_name: item.society_name,
          rural_id: rural.rural_id,

          sc_st: rural.sc_st,
          women: rural.women,
          general: rural.general,
          tot_voters: rural.tot_voters,

          remarks: item.remarks ?? null,
        });
      }
    }

    
    const form4 = form4_id
      ? await prisma.form4.update({
          where: { id: form4_id },
          data: {
            department_id,
            district_id,
            district_name,
            zone_id,
            zone_name,
            selected_soc_count: form2_selected_list.length,
            filed_count: filedArr.length,
            unfiled_count: unfiledArr.length,
          },
        })
      : await prisma.form4.create({
          data: {
            uid,
            department_id,
            district_id,
            district_name,
            zone_id,
            zone_name,
            selected_soc_count: form2_selected_list.length,
            filed_count: filedArr.length,
            unfiled_count: unfiledArr.length,
          },
        });

    
    await prisma.form4_filed_soc_mem_count.deleteMany({
      where: { form4_id: form4.id },
    });

    await prisma.form4_unfiled_soc_mem_count.deleteMany({
      where: { form4_id: form4.id },
    });

    if (filedArr.length) {
      await prisma.form4_filed_soc_mem_count.createMany({
        data: filedArr.map((r) => ({ ...r, form4_id: form4.id })),
      });
    }

    if (unfiledArr.length) {
      await prisma.form4_unfiled_soc_mem_count.createMany({
        data: unfiledArr.map((r) => ({ ...r, form4_id: form4.id })),
      });
    }

    return { form4_id: form4.id };
  },

 
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




  async listForm4(uid: number) {
  const forms = await prisma.form4.findMany({
    where: { uid },
    orderBy: { id: "desc" },
  });

  if (!forms.length) return [];

  
  const deptIds = [...new Set(forms.map(f => f.department_id).filter(Boolean))];
  const distIds = [...new Set(forms.map(f => f.district_id).filter(Boolean))];
  const zoneIds = [...new Set(forms.map(f => f.zone_id).filter(Boolean))];

  const [departments, districts, zones] = await Promise.all([
    prisma.department.findMany({ where: { id: { in: deptIds as number[] } } }),
    prisma.district.findMany({ where: { id: { in: distIds as number[] } } }),
    prisma.zone.findMany({ where: { id: { in: zoneIds as number[] } } }),
  ]);

  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));
  const distMap = Object.fromEntries(districts.map(d => [d.id, d.name]));
  const zoneMap = Object.fromEntries(zones.map(z => [z.id, z.name]));

  return forms.map(f => ({
    id: f.id,

    department_id: f.department_id,
    department_name: f.department_id ? cleanText(deptMap[f.department_id]) : null,

    district_id: f.district_id,
    district_name: f.district_id ? cleanText(distMap[f.district_id]) : null,
    
    zone_id: f.zone_id,
    zone_name: f.zone_id ? cleanText(zoneMap[f.zone_id]) : null,

    selected_soc_count: f.selected_soc_count,
    filed_count: f.filed_count,
    unfiled_count: f.unfiled_count,
  }));
},
async getEditableForm4(uid: number) {
  const form4 = await prisma.form4.findFirst({
    where: { uid },
    orderBy: { id: "desc" },
  });

  if (!form4) return null;

  const [filed, unfiled] = await Promise.all([
    prisma.form4_filed_soc_mem_count.findMany({
      where: { form4_id: form4.id },
    }),
    prisma.form4_unfiled_soc_mem_count.findMany({
      where: { form4_id: form4.id },
    }),
  ]);

  return {
    form4_id: form4.id,
    department_id: form4.department_id,
    district_id: form4.district_id,
    district_name: form4.district_name,
    zone_id: form4.zone_id,
    zone_name: form4.zone_name,

    form2_selected_list: [
      ...filed.map(f => ({
        society_id: f.society_id,
        society_name: f.society_name,
        rural_id: f.rural_id,

        sc_st: f.rural_sc_st,
        women: f.rural_women,
        general: f.rural_general,
        tot_voters: f.rural_tot_voters,

        selected: true,
        declared_sc_st: f.declared_sc_st,
        declared_women: f.declared_women,
        declared_general: f.declared_general,

        remarks: f.remarks,
      })),

      ...unfiled.map(u => ({
        society_id: u.society_id,
        society_name: u.society_name,
        rural_id: u.rural_id,

        sc_st: u.sc_st,
        women: u.women,
        general: u.general,
        tot_voters: u.tot_voters,

        selected: false,
        declared_sc_st: 0,
        declared_women: 0,
        declared_general: 0,

        remarks: u.remarks,
      })),
    ],
  };
}

};


function cleanText(text?: string | null) {
  if (!text) return text;
  return text.replace(/[\r\n]+/g, " ").trim();
}
