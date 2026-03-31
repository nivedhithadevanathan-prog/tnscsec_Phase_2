import { PrismaClient } from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";
export const prisma = new PrismaClient();

/*GET CHECKPOINT ZONES*/
export const getCheckpointZonesUsecase = async (
  userId: number | string,
  selectedIds: number[] = []
) => {
  const uid = Number(userId);

  if (!uid || Number.isNaN(uid)) {
    throw new Error("Invalid user id");
  }

  const user = await prisma.users.findFirst({
    where: { id: uid },
    select: {
      district_id: true,
      zone_id: true,
    },
  });

  if (!user?.district_id || !user?.zone_id) {
    return {
      total_zones: 0,
      selected_soc: [],
      non_selected_soc: [],
    };
  }

  // ✅ FIX: parse zone_id string → array
  let zoneIds: number[] = [];

  try {
    zoneIds = JSON.parse(user.zone_id || "[]");
  } catch (err) {
    zoneIds = [];
  }

  // ✅ DEBUG (optional)
  console.log("ZONE IDS:", zoneIds);
  console.log("SELECTED IDS:", selectedIds);

  const allZones = await prisma.master_zone.findMany({
    where: {
      district_id: user.district_id,
      zone_id: {
        in: zoneIds, // ✅ FIXED
      },
    },
    select: {
      id: true,
      association_name: true,
    },
  });

  const validZones = allZones.filter(
    (z) => z.association_name !== null
  );

  return {
    total_zones: validZones.length,

    selected_soc: validZones
      .filter((z) => selectedIds.includes(z.id))
      .map((z) => ({
        id: z.id,
        association_name: cleanText(z.association_name),
      })),

    non_selected_soc: validZones
      .filter((z) => !selectedIds.includes(z.id))
      .map((z) => ({
        id: z.id,
        association_name: cleanText(z.association_name),
      })),
  };
};

/*SUBMIT FORM1*/
export const submitForm1Usecase = async (payload: any) => {
  const {
    uid,
    department_id,
    district_id,
    zone_id,
    remark,
    selected_soc = [],
    non_selected_soc = [],
    rural_details = [],
  } = payload;

  const form1 = await prisma.form1.create({
    data: {
      uid,
      department_id,
      district_id,
      zone_id,
      remark: cleanText(remark) || null,
      selected_count: selected_soc.length,
      non_selected_count: non_selected_soc.length,
    },
  });

  const form1_id = form1.id;

  if (selected_soc.length) {
    await prisma.form1_selected_soc.createMany({
      data: selected_soc.map((soc: any) => {
        const rural = rural_details.find(
          (r: any) => r.rurel_id === soc.id
        );

        return {
          form1_id,
          society_id: soc.id,
          society_name: cleanText(soc.association_name),
          sc_st: rural?.sc_st ?? 0,
          women: rural?.women ?? 0,
          general: rural?.general ?? 0,
          tot_voters: rural?.tot_voters ?? 0,
        };
      }),
    });
  }

  if (non_selected_soc.length) {
    await prisma.form1_non_selected_soc.createMany({
      data: non_selected_soc.map((soc: any) => {
        const rural = rural_details.find(
          (r: any) => r.rurel_id === soc.id
        );

        return {
          form1_id,
          society_id: soc.id,
          society_name: cleanText(soc.association_name),
          sc_st: rural?.sc_st ?? 0,
          women: rural?.women ?? 0,
          general: rural?.general ?? 0,
          tot_voters: rural?.tot_voters ?? 0,
        };
      }),
    });
  }

  return {
    form1_id,
    message: "Form1 stored successfully",
  };
};

/*GET MASTER ZONES*/
/*GET MASTER ZONES*/
export const getMasterZonesUsecase = async (userId: number | string) => {
  const uid = Number(userId);

  if (!uid || Number.isNaN(uid)) {
    throw new Error("Invalid user id");
  }

  const user = await prisma.users.findFirst({
    where: { id: uid },
    select: {
      district_id: true,
      zone_id: true,
    },
  });

  if (!user?.district_id || !user?.zone_id) {
    return [];
  }

  let zoneIds: number[] = [];

  try {
    zoneIds = JSON.parse(user.zone_id || "[]");
  } catch (err) {
    zoneIds = [];
  }

  console.log("ZONE IDS:", zoneIds);

  const zones = await prisma.master_zone.findMany({
    where: {
      district_id: user.district_id,
      zone_id: {
        in: zoneIds, 
      },
    },
    select: {
      id: true,
      association_name: true,
    },
  });

  return zones.map((z) => ({
    id: z.id,
    association_name: cleanText(z.association_name),
  }));
};

/*GET RURAL DETAILS*/
export const getRuralDetailsUsecase = async (ids: number[]) => {
  return prisma.reservation.findMany({
    where: {
      rurel_id: { in: ids },
    },
    select: {
      rurel_id: true,
      sc_st: true,
      women: true,
      general: true,
      tot_voters: true,
    },
  });
};

/*GET FORM1 LIST*/
export const getForm1ListUsecase = async (params: {
  uid: number;
  role: number;
  zone_id?: string;
}) => {

  const { uid, role, zone_id } = params;

  let zoneIds: number[] = [];

  if (zone_id) {
    try {
      zoneIds = JSON.parse(zone_id);
    } catch {}
  }

  let where: any = {
    is_active: 1,
  };

  if (role === 1) {
    // admin → all
  } else if (role === 4) {
    where.zone_id = {
      in: zoneIds,
    };
  } else {
    where.uid = uid;
  }

  const form1List = await prisma.form1.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      form1_selected_soc: true,
      form1_non_selected_soc: true,
    },
  });

  if (!form1List.length) return [];

  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
  });

  const deptMap = new Map(
    departments.map((d) => [d.id, cleanText(d.name)])
  );

  return form1List.map((f) => ({
    id: f.id,
    department_id: f.department_id,
    department_name: deptMap.get(f.department_id ?? 0) || null,

    district_id: f.district_id,
    district_name: null,

    zone_id: f.zone_id,
    zone_name: null,

    selected_count: f.selected_count,
    non_selected_count: f.non_selected_count,
    remark: cleanText(f.remark),

    selected_soc: f.form1_selected_soc.map((s) => ({
      ...s,
      society_name: cleanText(s.society_name),
    })),

    non_selected_soc: f.form1_non_selected_soc.map((s) => ({
      ...s,
      society_name: cleanText(s.society_name),
    })),
  }));
};

/*GET EDITABLE FORM1*/
export const getEditableForm1Usecase = async (userId: number) => {
  const form1 = await prisma.form1.findFirst({
    where: {
      uid: userId,
      is_active: 1,
    },
    orderBy: { id: "desc" },
    include: {
      form1_selected_soc: true,
      form1_non_selected_soc: true,
    },
  });

  if (!form1) return null;

  const form2Exists = await prisma.form2.findFirst({
    where: { form1_id: form1.id },
    select: { id: true },
  });

  return {
    id: form1.id,
    department_id: form1.department_id,
    district_id: form1.district_id,
    zone_id: form1.zone_id,
    selected_count: form1.selected_count,
    non_selected_count: form1.non_selected_count,
    remark: cleanText(form1.remark),
    selected_soc: form1.form1_selected_soc.map((s) => ({
      ...s,
      society_name: cleanText(s.society_name),
    })),
    non_selected_soc: form1.form1_non_selected_soc.map((s) => ({
      ...s,
      society_name: cleanText(s.society_name),
    })),
    can_edit: !form2Exists,
  };
};

/*EDIT FORM1*/
export const editEditableForm1Usecase = async (payload: any) => {
  const {
    uid,
    department_id,
    district_id,
    zone_id,
    remark,
    selected_soc = [],
    non_selected_soc = [],
    rural_details = [],
  } = payload;

  const form1 = await prisma.form1.findFirst({
    where: { uid, is_active: 1 },
    orderBy: { id: "desc" },
  });

  if (!form1) throw new Error("Form1 not found");

  const form2Exists = await prisma.form2.findFirst({
    where: { form1_id: form1.id },
    select: { id: true },
  });

  if (form2Exists) {
    throw new Error("Editing is not allowed after proceeding");
  }

  await prisma.form1.update({
    where: { id: form1.id },
    data: {
      department_id,
      district_id,
      zone_id,
      remark: cleanText(remark) || null,
      selected_count: selected_soc.length,
      non_selected_count: non_selected_soc.length,
    },
  });

  await prisma.form1_selected_soc.deleteMany({
    where: { form1_id: form1.id },
  });

  await prisma.form1_non_selected_soc.deleteMany({
    where: { form1_id: form1.id },
  });

  if (selected_soc.length) {
    await prisma.form1_selected_soc.createMany({
      data: selected_soc.map((soc: any) => {
        const rural = rural_details.find(
          (r: any) => r.rurel_id === soc.id
        );

        return {
          form1_id: form1.id,
          society_id: soc.id,
          society_name: cleanText(soc.association_name),
          sc_st: rural?.sc_st ?? 0,
          women: rural?.women ?? 0,
          general: rural?.general ?? 0,
          tot_voters: rural?.tot_voters ?? 0,
        };
      }),
    });
  }

  if (non_selected_soc.length) {
    await prisma.form1_non_selected_soc.createMany({
      data: non_selected_soc.map((soc: any) => {
        const rural = rural_details.find(
          (r: any) => r.rurel_id === soc.id
        );

        return {
          form1_id: form1.id,
          society_id: soc.id,
          society_name: cleanText(soc.association_name),
          sc_st: rural?.sc_st ?? 0,
          women: rural?.women ?? 0,
          general: rural?.general ?? 0,
          tot_voters: rural?.tot_voters ?? 0,
        };
      }),
    });
  }

  return {
    form1_id: form1.id,
    message: "Form1 updated successfully",
  };
};
