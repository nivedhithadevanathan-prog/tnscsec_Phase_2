import prisma from "../../shared/prisma";

export const getForm1SelectedService = async (uid: number) => {
  const form1 = await prisma.form1.findFirst({
    where: {
      uid,
      form2: { none: {} }, 
    },
    orderBy: { id: "desc" },
    include: { selected_soc: true },
  });

  if (!form1) throw new Error("No editable Form1 found");

  return {
    form1_id: form1.id,
    department_id: form1.department_id,
    district_id: form1.district_id,
    zone_id: form1.zone_id,
    masterzone_count: form1.selected_soc.length,
    selected_soc: form1.selected_soc,
  };
};

export const checkboxForm2Service = async (uid: number, selectedIds: number[]) => {
  const form1 = await prisma.form1.findFirst({
    where: { uid, form2: { none: {} } },
    orderBy: { id: "desc" },
    include: { selected_soc: true },
  });

  if (!form1) throw new Error("No editable Form1 found");

  const selectedSet = new Set(selectedIds.map(Number));
  const selected = form1.selected_soc.filter(s =>
    selectedSet.has(Number(s.society_id))
  );

  const nonSelected = form1.selected_soc.filter(
    s => !selectedSet.has(Number(s.society_id))
  );

  return {
    selected,
    nonSelected,
    selectedCount: selected.length,
  };
};

export const submitForm2Service = async ({ uid, selectedIds, remark }: any) => {
  const form1 = await prisma.form1.findFirst({
    where: { uid, form2: { none: {} } },
    orderBy: { id: "desc" },
    include: { selected_soc: true },
  });

  if (!form1) throw new Error("No editable Form1 found");

  const selectedSet = new Set(selectedIds.map(Number));
  const selectedRows = form1.selected_soc.filter(s =>
    selectedSet.has(Number(s.society_id))
  );
  const nonSelectedRows = form1.selected_soc.filter(
    s => !selectedSet.has(Number(s.society_id))
  );

  return prisma.$transaction(async tx => {
    const form2 = await tx.form2.create({
      data: {
        uid,
        form1_id: form1.id,
        department_id: form1.department_id,
        district_id: form1.district_id,
        zone_id: form1.zone_id,
        masterzone_count: form1.selected_soc.length,
        selected_soc_count: selectedRows.length,
        remark,
      },
    });

    await tx.form2_selected_soc.createMany({
      data: selectedRows.map(r => ({
        form2_id: form2.id,
        society_id: r.society_id!,
        society_name: r.society_name!,
      })),
    });

    await tx.form2_non_selected_soc.createMany({
      data: nonSelectedRows.map(r => ({
        form2_id: form2.id,
        society_id: r.society_id!,
        society_name: r.society_name!,
      })),
    });

    return form2;
  });
};

export const getSubmittedForm2Service = async (uid: number) => {
  return prisma.form2.findFirst({
    where: { uid },
    orderBy: { id: "desc" },
    include: { selected_soc: true, non_selected_soc: true },
  });
};

export const listForm2Service = async (uid: number) => {
  
  const forms = await prisma.form2.findMany({
    where: { uid },
    orderBy: { id: "desc" },
    include: {
      selected_soc: true,
      non_selected_soc: true,
    },
  });

  if (!forms.length) return [];

  
  const departmentIds = [...new Set(forms.map(f => f.department_id).filter(Boolean))];
  const districtIds = [...new Set(forms.map(f => f.district_id).filter(Boolean))];
  const zoneIds = [...new Set(forms.map(f => f.zone_id).filter(Boolean))];

  
  const [departments, districts, zones] = await Promise.all([
    prisma.department.findMany({
      where: { id: { in: departmentIds as number[] } },
      select: { id: true, name: true },
    }),
    prisma.district.findMany({
      where: { id: { in: districtIds as number[] } },
      select: { id: true, name: true },
    }),
    prisma.zone.findMany({
      where: { id: { in: zoneIds as number[] } },
      select: { id: true, name: true },
    }),
  ]);

  
  const deptMap = Object.fromEntries(departments.map(d => [d.id, cleanText(d.name)]));
  const distMap = Object.fromEntries(districts.map(d => [d.id, cleanText(d.name)]));
  const zoneMap = Object.fromEntries(zones.map(z => [z.id, cleanText(z.name)]));

  
  return forms.map(f => {
    const selected = f.selected_soc ?? [];
    const nonSelected = f.non_selected_soc ?? [];

    const masterzoneSocieties = [
      ...selected,
      ...nonSelected,
    ].map(s => ({
      society_id: s.society_id,
      society_name: cleanText(s.society_name),
    }));

    return {
      id: f.id,

      department_id: f.department_id,
      department_name: f.department_id ? deptMap[f.department_id] : null,

      district_id: f.district_id,
      district_name: f.district_id ? distMap[f.district_id] : null,

      zone_id: f.zone_id,
      zone_name: f.zone_id ? zoneMap[f.zone_id] : null,

      masterzone_count: masterzoneSocieties.length,
      masterzone_societies: masterzoneSocieties,

      selected_count: selected.length,
      non_selected_count: nonSelected.length,

      remark: cleanText(f.remark),

      selected_soc: selected.map(s => ({
        society_id: s.society_id,
        society_name: cleanText(s.society_name),
      })),

      non_selected_soc: nonSelected.map(s => ({
        society_id: s.society_id,
        society_name: cleanText(s.society_name),
      })),
    };
  });
};



export const getEditableForm2Service = async (uid: number) => {
  const form2 = await prisma.form2.findFirst({
    where: {
      uid,
      form3: { none: {} }, 
    },
    orderBy: { id: "desc" },
    include: {
      selected_soc: true,
      non_selected_soc: true,
    },
  });

  if (!form2) return null;

  return {
    id: form2.id,
    form1_id: form2.form1_id,

    department_id: form2.department_id,
    district_id: form2.district_id,
    zone_id: form2.zone_id,

    masterzone_count: form2.masterzone_count,
    selected_soc_count: form2.selected_soc_count,

    remark: cleanText(form2.remark),

    selected_soc: form2.selected_soc.map(s => ({
      society_id: s.society_id,
      society_name: cleanText(s.society_name),
    })),

    non_selected_soc: form2.non_selected_soc.map(s => ({
      society_id: s.society_id,
      society_name: cleanText(s.society_name),
    })),
  };
};
 


export const editForm2Service = async (
  uid: number,
  { selectedIds, remark }: any
) => {
  const form2 = await prisma.form2.findFirst({
    where: {
      uid,
      form3: { none: {} }, 
    },
    orderBy: { id: "desc" },
    include: {
      selected_soc: true,
      non_selected_soc: true,
    },
  });

  if (!form2) {
    throw new Error("Form2 is locked or not found");
  }

  const allSocieties = [
    ...form2.selected_soc,
    ...form2.non_selected_soc,
  ];

  const selectedSet = new Set(selectedIds.map(Number));

  const newSelected = allSocieties.filter(s =>
    selectedSet.has(Number(s.society_id))
  );

  const newNonSelected = allSocieties.filter(
    s => !selectedSet.has(Number(s.society_id))
  );

  return prisma.$transaction(async tx => {
    
    await tx.form2_selected_soc.deleteMany({
      where: { form2_id: form2.id },
    });

    await tx.form2_non_selected_soc.deleteMany({
      where: { form2_id: form2.id },
    });

    
    if (newSelected.length) {
      await tx.form2_selected_soc.createMany({
        data: newSelected.map(s => ({
          form2_id: form2.id,
          society_id: s.society_id!,
          society_name: cleanText(s.society_name),
        })),
      });
    }

    if (newNonSelected.length) {
      await tx.form2_non_selected_soc.createMany({
        data: newNonSelected.map(s => ({
          form2_id: form2.id,
          society_id: s.society_id!,
          society_name: cleanText(s.society_name),
        })),
      });
    }

    
    return tx.form2.update({
      where: { id: form2.id },
      data: {
        selected_soc_count: newSelected.length,
        remark: cleanText(remark),
      },
    });
  });
};


function cleanText(text?: string | null) {
  if (!text) return text;
  return text.replace(/[\r\n]+/g, " ").trim();
}

