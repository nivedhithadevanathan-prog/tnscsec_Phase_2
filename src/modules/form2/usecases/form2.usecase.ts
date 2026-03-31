import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

import { form2Service, form2Services } from "../services/form2.service";

export const form2Usecases = {
  /*GET selected societies from Form1*/
  async fetchForm1SelectedSocieties(form1_id: number) {
    if (!form1_id) throw new Error("form1_id is required");

    const form1 = await prisma.form1.findUnique({
      where: { id: form1_id },
      select: {
        id: true,
        department_id: true,
        district_id: true,
        zone_id: true,
      },
    });

    if (!form1) return null;

    const selected_soc = await prisma.form1_selected_soc.findMany({
      where: { form1_id },
    });

    return {
      form1_id: form1.id,
      department_id: form1.department_id,
      district_id: form1.district_id,
      zone_id: form1.zone_id,
      masterzone_count: selected_soc.length,
      selected_soc,
    };
  },

  /*CHECKBOX Update selection*/
 async checkboxSelectionUsecase(payload: {
  uid: number;
  form1_id: number;
  selected_soc_ids: number[];
}) {
  const { uid, form1_id, selected_soc_ids } = payload;

  if (!uid) throw new Error("uid is required");
  if (!form1_id) throw new Error("form1_id is required");
  if (!Array.isArray(selected_soc_ids)) {
    throw new Error("selected_soc_ids must be an array");
  }

  return form2Service.handleCheckboxSelection(
    uid,
    form1_id,
    selected_soc_ids
  );
},

  /*SUBMIT Create Form2*/
async submitForm2Usecase(payload: any) {
  
  //compute selected count

  const selectedCount =
    payload.selected_soc?.length ??
    payload.selected_soc_ids?.length ??
    0;

  //Create parent Form2
  const form2Record = await form2Service.createForm2Parent({
    ...payload,
    selected_soc_count: selectedCount,
  });

  const form2Id = form2Record.id;

  //Insert SELECTED societies
  if (payload.selected_soc?.length) {
    await prisma.form2_selected_soc.createMany({
      data: payload.selected_soc.map((s: any) => ({
        form2_id: form2Id,
        society_id: s.society_id,
        society_name: s.society_name,
      })),
    });
  }

  //Insert NON-SELECTED societies
  if (payload.non_selected_soc?.length) {
    await prisma.form2_non_selected_soc.createMany({
      data: payload.non_selected_soc.map((s: any) => ({
        form2_id: form2Id,
        society_id: s.society_id,
        society_name: s.society_name,
      })),
    });
  }

  //Return response
  return form2Service.buildSubmitResponse(
    form2Record,
    selectedCount
  );
},

/*LIST Form2*/
async getForm2ListByUser(params: { 
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

  let where: any = {
    is_active: true,
  };

  if (role === 1) {
    // admin → all
  } 
  else if (role === 4) {
    where.zone_id = {
      in: zoneIds,
    };
  } 
  else {
    where.uid = uid;
  }

  return form2Services.getForm2ListByUser(where);
},

  /*EDITABLE Latest Form2*/
  async getEditableForm2(uid: number) {
    if (!uid) throw new Error("uid is required");

    return form2Services.getEditableForm2(uid);
  },

  /*Edit Form2*/
  async editForm2(payload: {
    uid: number;
    form2_id: number;
    department_id?: number | null;
    district_id?: number | null;
    zone_id?: number | null;
    masterzone_count?: number | null;
    remark?: string | null;
    selected_soc_ids: number[];
  }) {
    return form2Service.editForm2(payload);
  },
};

export default form2Usecases;
