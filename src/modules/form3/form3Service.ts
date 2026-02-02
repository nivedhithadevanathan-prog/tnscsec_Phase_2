import prisma from "../../shared/prisma";


const toIntFlag = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const v = value.toLowerCase();
    if (v === "yes" || v === "completed" || v === "verified") return 1;
    return 0;
  }
  return null;
};


export const getForm3ListService = async (user: any) => {
  const district_id = Number(user.districtId);
  const zone_id = Number(user.zoneId);

  if (!district_id || !zone_id)
    return { error: "User has no district_id or zone_id assigned" };

  const district = await prisma.district.findFirst({
    where: { id: district_id },
    select: { name: true }
  });

  const zone = await prisma.zone.findFirst({
    where: { id: zone_id },
    select: { name: true }
  });

  // Fetch Form2 data
  const form2Data = await prisma.form2.findMany({
    where: { district_id, zone_id, is_active: true },
    include: { selected_soc: true },
    orderBy: { id: "desc" }
  });

  const form2List = form2Data.map(f => ({
    form2_id: f.id,
    district_id: f.district_id,
    zone_id: f.zone_id,

    districtName: district?.name || "",
    zoneName: zone?.name || "",

    selected_soc_count: f.selected_soc_count,
    masterzone_count: f.masterzone_count,

    selected_soc: f.selected_soc.map(soc => ({
      society_id: soc.society_id,
      society_name: soc.society_name
    }))
  }));

  return {
    districtName: district?.name || "",
    zoneName: zone?.name || "",
    form2List,
  };
};



export const submitForm3Service = async (payload: any, user: any) => {
  if (!payload.form2_id) throw new Error("form2_id is required");

  const uid = Number(user.uid);
  const department_id = Number(user.departmentId);
  const district_id = Number(user.districtId);
  const zone_id = Number(user.zoneId);

  if (!uid || !district_id || !zone_id) {
    throw new Error("User mapping missing");
  }

  const form2 = await prisma.form2.findFirst({
    where: {
      id: payload.form2_id,
      is_active: true,
    },
    include: {
      selected_soc: true,
    },
  });

  if (!form2) throw new Error("Form2 not found");

  const district = await prisma.district.findFirst({
    where: { id: district_id },
    select: { name: true },
  });

  const zone = await prisma.zone.findFirst({
    where: { id: zone_id },
    select: { name: true },
  });

  return prisma.$transaction(async (tx) => {
    
    const form3 = await tx.form3.create({
      data: {
        uid,
        department_id,
        form2_id: payload.form2_id,
        district_id,
        zone_id,
        remarks: payload.remarks ?? null,
        district_name: district?.name ?? null,
        zone_name: zone?.name ?? null,
        selected_soc_count: form2.selected_soc_count ?? 0,
        is_active: 1,
      },
    });

    
    const societyRows = await Promise.all(
      payload.society_entries.map(async (entry: any) => {
        const reservation = await tx.reservation.findFirst({
          where: {
            rurel_id: entry.society_id,
            is_active: 1,
          },
          select: {
            rurel_id: true,
            tot_voters: true,
          },
        });

        return {
          form3_id: form3.id,
          society_id: entry.society_id,
          society_name: entry.society_name,

          ass_memlist: toIntFlag(entry.ass_memlist),
          ero_claim: toIntFlag(entry.ero_claim),

          jcount: Number(entry.jcount) || 0,
          rcount: Number(entry.rcount) || 0,
          total: Number(entry.total) || 0,

          rural_id: reservation?.rurel_id ?? null,
          tot_voters: reservation?.tot_voters ?? null,
        };
      })
    );

    if (societyRows.length > 0) {
      await tx.form3_societies.createMany({
        data: societyRows,
      });
    }

    return {
      form3_id: form3.id,
    };
  });
};


export const listForm3Service = async (uid: number) => {

  const forms = await prisma.form3.findMany({
    where: {
      uid,
      is_active: 1,
    },
    orderBy: { id: "desc" },
    include: {
      form3_societies: true,
    },
  });

  
  const departmentIds = [...new Set(forms.map(f => f.department_id).filter(Boolean))];
  const districtIds = [...new Set(forms.map(f => f.district_id).filter(Boolean))];
  const zoneIds = [...new Set(forms.map(f => f.zone_id).filter(Boolean))];

  
  const departments = await prisma.department.findMany({
    where: { id: { in: departmentIds as number[] } },
    select: { id: true, name: true },
  });

  const districts = await prisma.district.findMany({
    where: { id: { in: districtIds as number[] } },
    select: { id: true, name: true },
  });

  const zones = await prisma.zone.findMany({
    where: { id: { in: zoneIds as number[] } },
    select: { id: true, name: true },
  });

  
  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));
  const distMap = Object.fromEntries(districts.map(d => [d.id, d.name]));
  const zoneMap = Object.fromEntries(zones.map(z => [z.id, z.name]));

 
  return forms.map(f => ({
    id: f.id,
    form2_id: f.form2_id,

    department_id: f.department_id,
    department_name: f.department_id
      ? cleanText(deptMap[f.department_id])
      : null,

    district_id: f.district_id,
    district_name: f.district_id
      ? cleanText(distMap[f.district_id])
      : null,

    zone_id: f.zone_id,
    zone_name: f.zone_id
      ? cleanText(zoneMap[f.zone_id])
      : null,

    selected_soc_count: f.selected_soc_count,
    remarks: cleanText(f.remarks),

    
    societies: f.form3_societies.map(s => ({
      society_id: s.society_id,
      society_name: cleanText(s.society_name),
      ass_memlist: s.ass_memlist,
      ero_claim: s.ero_claim,
      jcount: s.jcount,
      rcount: s.rcount,
      total: s.total,
      rural_id: s.rural_id,
      tot_voters: s.tot_voters,
    })),
  }));
};


export const getSubmittedForm3Service = async (form3_id: number, uid: number) => {
  const form3 = await prisma.form3.findFirst({
    where: {
      id: form3_id,
      uid: uid 
    },
    include: {
      form3_societies: true
    }
  });

  if (!form3) return null;

  return {
    id: form3.id,
    form2_id: form3.form2_id,
    department_id: form3.department_id,
    district_id: form3.district_id,
    zone_id: form3.zone_id,
    district_name: form3.district_name,
    zone_name: form3.zone_name,
    selected_soc_count: form3.selected_soc_count,
    remarks: form3.remarks,

    societies: form3.form3_societies
  };
};


export const getEditableForm3Service = async (uid: number) => {
  const form3 = await prisma.form3.findFirst({
    where: {
      uid,
      is_active: 1, 
    },
    orderBy: { id: "desc" },
    include: {
      form3_societies: true, 
    },
  });

  if (!form3) return null;

  return {
    id: form3.id,
    form2_id: form3.form2_id,

    department_id: form3.department_id,
    district_id: form3.district_id,
    zone_id: form3.zone_id,

    selected_soc_count: form3.selected_soc_count,
    remarks: cleanText(form3.remarks),

    societies: form3.form3_societies.map((s: any) => ({
      society_id: s.society_id,
      society_name: cleanText(s.society_name),

      
      ass_memlist: s.ass_memlist !== null ? Number(s.ass_memlist) : null,
      ero_claim: s.ero_claim,


      jcount: s.jcount,
      rcount: s.rcount,
      total: s.total,

      rural_id: s.rural_id,
      tot_voters: s.tot_voters,
    })),
  };
};



export const editForm3Service = async (uid: number, payload: any) => {
  const form3 = await prisma.form3.findFirst({
    where: {
      uid,
      is_active: 1, 
    },
    orderBy: { id: "desc" },
    include: {
      form3_societies: true, 
    },
  });

  if (!form3) {
    throw new Error("Form3 is locked or not found");
  }

  return prisma.$transaction(async tx => {
    
    await tx.form3.update({
      where: { id: form3.id },
      data: {
        remarks: payload.remarks ?? null,
      },
    });

    
    await tx.form3_societies.deleteMany({
      where: { form3_id: form3.id },
    });

    
    const childRows = payload.society_entries.map((entry: any) => ({
      form3_id: form3.id,
      society_id: entry.society_id,
      society_name: entry.society_name,

      ass_memlist:
        entry.ass_memlist !== null ? Number(entry.ass_memlist) : null,

      
        ero_claim: cleanText(entry.ero_claim),


      jcount: entry.jcount ?? null,
      rcount: entry.rcount ?? null,
      total: entry.total ?? null,

      rural_id: entry.rural_id ?? null,
      tot_voters: entry.tot_voters ?? null,
    }));

    await tx.form3_societies.createMany({ data: childRows });

    return { form3_id: form3.id };
  });
};




function cleanText(text: string | null | undefined) {
  if (!text) return text;
  return text.replace(/[\r\n]+/g, " ").trim();
}
