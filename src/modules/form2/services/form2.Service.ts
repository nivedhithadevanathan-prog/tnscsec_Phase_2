import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

/* =========================================================
   SERVICE GROUP 1 — READ (GET / LIST / EDITABLE)
========================================================= */
export const form2Services = {
 async getForm2ListByUser(uid: number) {
  const form2List = await prisma.form2.findMany({
    where: { uid, is_active: true },
    orderBy: { id: "desc" },
    include: {
      form2_selected_soc: {
        select: { society_id: true, society_name: true },
      },
      form2_non_selected_soc: {
        select: { society_id: true, society_name: true },
      },
    },
  });

  return form2List.map(item => ({
    id: item.id,
    uid: item.uid, // ✅ THIS IS WHERE UID IS ADDED
    form1_id: item.form1_id,

    department_id: item.department_id,
    district_id: item.district_id,
    zone_id: item.zone_id,

    masterzone_count: item.masterzone_count,
    selected_soc_count: item.selected_soc_count,
    remark: item.remark,
    is_active: item.is_active,

    selected_soc: item.form2_selected_soc,
    non_selected_soc: item.form2_non_selected_soc,
  }));
},


  async getEditableForm2(uid: number) {
    return prisma.form2.findFirst({
      where: { uid, is_active: true },
      orderBy: { id: "desc" },
      include: {
        form2_selected_soc: true,
        form2_non_selected_soc: true,
      },
    });
  },
};

/* =========================================================
   SERVICE GROUP 2 — WRITE (SUBMIT / CHECKBOX / EDIT)
========================================================= */
export const form2Service = {
  /* ---------- SUBMIT ---------- */
 async createForm2Parent(payload: any) {
  const {
    uid,              // 🔥 REQUIRED
    department_id,
    district_id,
    zone_id,
    form1_id,
    masterzone_count,
    remark,
    is_active,
    selected_soc_count, // ✅ ADD THIS
  } = payload;

  if (!uid) {
    throw new Error("uid is required to create Form2");
  }

  return prisma.form2.create({
    data: {
      uid,
      department_id,
      district_id,
      zone_id,
      form1_id,
      masterzone_count,
      remark,
      is_active,
      selected_soc_count, // ✅ SAVE TO DB
    },
  });
},


  buildSubmitResponse(form2Record: any, selectedCount: number) {
    return {
      form2_id: form2Record.id,
      selected_soc_count: selectedCount,
    };
  },

  /* ---------- CHECKBOX ---------- */
 async handleCheckboxSelection(
  uid: number,
  form1_id: number,
  selected_soc_ids: number[]
) {
  if (!form1_id) throw new Error("form1_id is required");

  /* -------------------------------------------------
     1️⃣ Find or create Form2 (by form1_id)
  -------------------------------------------------- */
  let form2 = await prisma.form2.findFirst({
    where: {
      form1_id,
      uid,
      is_active: true,
    },
  });

  if (!form2) {
    form2 = await prisma.form2.create({
      data: {
        uid,
        form1_id,
        is_active: true,
        selected_soc_count: 0,
      },
    });
  }

  const form2_id = form2.id;

  /* -------------------------------------------------
     2️⃣ Fetch all Form1 societies
  -------------------------------------------------- */
  const all = await prisma.form1_selected_soc.findMany({
    where: { form1_id },
    select: { society_id: true, society_name: true },
  });

  if (!all.length) {
    throw new Error("No societies found for this form1");
  }

  /* -------------------------------------------------
     3️⃣ Split selected / unselected
  -------------------------------------------------- */
  const selected = all.filter(s =>
    selected_soc_ids.includes(Number(s.society_id))
  );

  const unselected = all.filter(
    s => !selected_soc_ids.includes(Number(s.society_id))
  );

  /* -------------------------------------------------
     4️⃣ Replace previous checkbox data
  -------------------------------------------------- */
  await prisma.form2_selected_soc.deleteMany({ where: { form2_id } });
  await prisma.form2_non_selected_soc.deleteMany({ where: { form2_id } });

  if (selected.length) {
    await prisma.form2_selected_soc.createMany({
      data: selected.map(s => ({
        form2_id,
        society_id: Number(s.society_id),
        society_name: s.society_name,
      })),
    });
  }

  if (unselected.length) {
    await prisma.form2_non_selected_soc.createMany({
      data: unselected.map(s => ({
        form2_id,
        society_id: Number(s.society_id),
        society_name: s.society_name,
      })),
    });
  }

  /* -------------------------------------------------
     5️⃣ Update selected count
  -------------------------------------------------- */
  await prisma.form2.update({
    where: { id: form2_id },
    data: {
      selected_soc_count: selected.length,
    },
  });

  return {
    form2_id,
    selected: selected.length,
    unselected: unselected.length,
  };
},


  /* ---------- EDIT ---------- */
  async editForm2(payload: any) {
    return payload; // logic already validated earlier
  },
};
