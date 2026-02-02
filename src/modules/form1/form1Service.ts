import prisma from "../../shared/prisma";

export const Form1Service = {

  
  async submitForm1(payload: any) {
    const userMeta = await prisma.users.findFirst({
      where: { id: Number(payload.uid) },
      select: {
        department_id: true,
        district_id: true,
        zone_id: true,
      },
    });

    const ruralMap: Record<number, any> = {};
    payload.rural_details?.forEach((r: any) => {
      ruralMap[Number(r.rurel_id)] = r;
    });

    return prisma.form1.create({
      data: {
        uid: Number(payload.uid),

        department_id: userMeta?.department_id
          ? Number(userMeta.department_id)
          : null,

        district_id: userMeta?.district_id
          ? Number(userMeta.district_id)
          : null,

        zone_id: userMeta?.zone_id
          ? Number(userMeta.zone_id)
          : null,

        remark: payload.remark ?? null,

        selected_count: Number(payload.selected_soc.length),
        non_selected_count: Number(payload.non_selected_soc.length),

        selected_soc: {
          create: payload.selected_soc.map((soc: any) => {
            const r = ruralMap[Number(soc.id)] || {};
            return {
              society_id: Number(soc.id),
              society_name: cleanText(soc.association_name),
              sc_st: Number(r.sc_st ?? 0),
              women: Number(r.women ?? 0),
              general: Number(r.general ?? 0),
              tot_voters: Number(r.tot_voters ?? 0),
            };
          }),
        },

        non_selected_soc: {
          create: payload.non_selected_soc.map((soc: any) => {
            const r = ruralMap[Number(soc.id)] || {};
            return {
              society_id: Number(soc.id),
              society_name: cleanText(soc.association_name),
              sc_st: Number(r.sc_st ?? 0),
              women: Number(r.women ?? 0),
              general: Number(r.general ?? 0),
              tot_voters: Number(r.tot_voters ?? 0),
            };
          }),
        },
      },
    });
  },

 
  async getEditableForm1(uid: number) {
    const form1 = await prisma.form1.findFirst({
      where: { uid },
      orderBy: { id: "desc" },
      include: {
        selected_soc: true,
        non_selected_soc: true,
        form2: true,
      },
    });

    if (!form1) return null;

    if (form1.form2.length > 0) {
      throw new Error("Form1 is locked because Form2 already exists");
    }

    
    const [department, district, zone] = await Promise.all([
      form1.department_id
        ? prisma.department.findUnique({
            where: { id: form1.department_id },
            select: { name: true },
          })
        : null,

      form1.district_id
        ? prisma.district.findUnique({
            where: { id: form1.district_id },
            select: { name: true },
          })
        : null,

      form1.zone_id
        ? prisma.zone.findUnique({
            where: { id: form1.zone_id },
            select: { name: true },
          })
        : null,
    ]);

    return {
      id: form1.id,

      department_id: form1.department_id,
      department_name: cleanText(department?.name ?? null),

      district_id: form1.district_id,
      district_name: cleanText(district?.name ?? null),

      zone_id: form1.zone_id,
      zone_name: cleanText(zone?.name ?? null),

      selected_count: form1.selected_count,
      non_selected_count: form1.non_selected_count,

      remark: cleanText(form1.remark),

      selected_soc: form1.selected_soc.map(s => ({
        society_id: s.society_id,
        society_name: cleanText(s.society_name),
        sc_st: s.sc_st ?? 0,
        women: s.women ?? 0,
        general: s.general ?? 0,
        tot_voters: s.tot_voters ?? 0,
      })),

      non_selected_soc: form1.non_selected_soc.map(s => ({
        society_id: s.society_id,
        society_name: cleanText(s.society_name),
        sc_st: s.sc_st ?? 0,
        women: s.women ?? 0,
        general: s.general ?? 0,
        tot_voters: s.tot_voters ?? 0,
      })),
    };
  },

 
  async editEditableForm1(uid: number, payload: any) {
    const form1 = await prisma.form1.findFirst({
      where: { uid },
      orderBy: { id: "desc" },
      include: { form2: true },
    });

    if (!form1) throw new Error("No Form1 found");
    if (form1.form2.length > 0)
      throw new Error("Form1 is locked because Form2 already exists");

    const ruralMap: Record<number, any> = {};
    payload.rural_details.forEach((r: any) => {
      ruralMap[Number(r.rurel_id)] = r;
    });
 
    return prisma.$transaction(async (tx) => {
      await tx.form1_selected_soc.deleteMany({
        where: { form1_id: form1.id },
      });

      await tx.form1_non_selected_soc.deleteMany({
        where: { form1_id: form1.id },
      });

      const updated = await tx.form1.update({
        where: { id: form1.id },
        data: {
          remark: payload.remark ?? null,
          selected_count: payload.selected_soc.length,
          non_selected_count: payload.non_selected_soc.length,

          selected_soc: {
            create: payload.selected_soc.map((soc: any) => {
              const r = ruralMap[Number(soc.id)] || {};
              return {
                society_id: Number(soc.id),
                society_name: cleanText(soc.association_name),
                sc_st: Number(r.sc_st ?? 0),
                women: Number(r.women ?? 0),
                general: Number(r.general ?? 0),
                tot_voters: Number(r.tot_voters ?? 0),
              };
            }),
          },

          non_selected_soc: {
            create: payload.non_selected_soc.map((soc: any) => {
              const r = ruralMap[Number(soc.id)] || {};
              return {
                society_id: Number(soc.id),
                society_name: cleanText(soc.association_name),
                sc_st: Number(r.sc_st ?? 0),
                women: Number(r.women ?? 0),
                general: Number(r.general ?? 0),
                tot_voters: Number(r.tot_voters ?? 0),
              };
            }),
          },
        },
        include: {
          selected_soc: true,
          non_selected_soc: true,
        },
      });

      
      const [department, district, zone] = await Promise.all([
        updated.department_id
          ? tx.department.findUnique({
              where: { id: updated.department_id },
              select: { name: true },
            })
          : null,

        updated.district_id
          ? tx.district.findUnique({
              where: { id: updated.district_id },
              select: { name: true },
            })
          : null,

        updated.zone_id
          ? tx.zone.findUnique({
              where: { id: updated.zone_id },
              select: { name: true },
            })
          : null,
      ]);

      return {
        ...updated,
        department_name: cleanText(department?.name ?? null),
        district_name: cleanText(district?.name ?? null),
        zone_name: cleanText(zone?.name ?? null),
      };
    });
  },

 
  async getSubmittedForm1(form1Id: number, uid: number) {
    return prisma.form1.findFirst({
      where: { id: form1Id, uid },
      include: {
        selected_soc: true,
        non_selected_soc: true,
      },
    });
  },

async listForm1(uid: number) {
  
  const forms = await prisma.form1.findMany({
    where: { uid },
    orderBy: { id: "desc" },
    include: {
      selected_soc: true,
      non_selected_soc: true,
    },
  });

  if (!forms.length) return [];

  
  const departmentIds = [
    ...new Set(forms.map(f => f.department_id).filter(Boolean)),
  ] as number[];

  const districtIds = [
    ...new Set(forms.map(f => f.district_id).filter(Boolean)),
  ] as number[];

  const zoneIds = [
    ...new Set(forms.map(f => f.zone_id).filter(Boolean)),
  ] as number[];

  
  const [departments, districts, zones] = await Promise.all([
    prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true },
    }),
    prisma.district.findMany({
      where: { id: { in: districtIds } },
      select: { id: true, name: true },
    }),
    prisma.zone.findMany({
      where: { id: { in: zoneIds } },
      select: { id: true, name: true },
    }),
  ]);

  
  const deptMap = Object.fromEntries(
    departments.map(d => [d.id, cleanText(d.name)])
  );

  const distMap = Object.fromEntries(
    districts.map(d => [d.id, cleanText(d.name)])
  );

  const zoneMap = Object.fromEntries(
    zones.map(z => [z.id, cleanText(z.name)])
  );

  
  return forms.map(f => {
    const selectedCount = f.selected_count ?? 0;
    const nonSelectedCount = f.non_selected_count ?? 0;

    
    const masterzoneSocieties = [
      ...f.selected_soc,
      ...f.non_selected_soc,
    ].map(s => ({
      society_id: s.society_id,
      society_name: cleanText(s.society_name),
    }));

    return {
      id: f.id,

      department_id: f.department_id,
      department_name: f.department_id
        ? deptMap[f.department_id]
        : null,

      district_id: f.district_id,
      district_name: f.district_id
        ? distMap[f.district_id]
        : null,

      zone_id: f.zone_id,
      zone_name: f.zone_id
        ? zoneMap[f.zone_id]
        : null,

      
      masterzone_count: selectedCount + nonSelectedCount,

      
      masterzone_societies: masterzoneSocieties,

      selected_count: selectedCount,
      non_selected_count: nonSelectedCount,

      remark: cleanText(f.remark),

      selected_soc: f.selected_soc.map(s => ({
        society_id: s.society_id,
        society_name: cleanText(s.society_name),
        sc_st: s.sc_st ?? 0,
        women: s.women ?? 0,
        general: s.general ?? 0,
        tot_voters: s.tot_voters ?? 0,
      })),

      non_selected_soc: f.non_selected_soc.map(s => ({
        society_id: s.society_id,
        society_name: cleanText(s.society_name),
        sc_st: s.sc_st ?? 0,
        women: s.women ?? 0,
        general: s.general ?? 0,
        tot_voters: s.tot_voters ?? 0,
      })),
    };
  });
},


  async getMasterZones(userId: number) {
    const user = await prisma.users.findFirst({
      where: { id: userId },
      select: { district_id: true, zone_id: true },
    });

    if (!user?.district_id || !user?.zone_id) return [];

    const zones = await prisma.master_zone.findMany({
      where: {
        district_id: Number(user.district_id),
        zone_id: Number(user.zone_id),
      },
      select: { id: true, association_name: true },
    });

    return zones.map(z => ({
      ...z,
      association_name: cleanText(z.association_name),
    }));
  },

  async getCheckpointZones(userId: number, selectedIds: number[]) {
    const user = await prisma.users.findFirst({
      where: { id: userId },
      select: { district_id: true, zone_id: true },
    });

    if (!user?.district_id || !user?.zone_id) {
      return { selected_soc: [], non_selected_soc: [] };
    }

    const zones = await prisma.master_zone.findMany({
      where: {
        district_id: Number(user.district_id),
        zone_id: Number(user.zone_id),
      },
      select: { id: true, association_name: true },
    });

    return {
      selected_soc: zones.filter(z => selectedIds.includes(z.id)),
      non_selected_soc: zones.filter(z => !selectedIds.includes(z.id)),
    };
  },

  async getRuralDetails(assocIds: number[]) {
    return prisma.reservation.findMany({
      where: { rurel_id: { in: assocIds } },
      select: {
        rurel_id: true,
        sc_st: true,
        women: true,
        general: true,
        tot_voters: true,
      },
    });
  },
};


function cleanText(text?: string | null) {
  if (!text) return text;
  return text.replace(/[\r\n]+/g, " ").trim();
}
