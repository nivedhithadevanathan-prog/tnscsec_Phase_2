import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()
import { form3Service } from "../../form3/Services/form3.Service";

export const form3Usecases = {

  /*GET Form2 list for Form3*/
  async getForm2ListForForm3(uid: number, fm2id?: number | string) {
    return await form3Service.fetchForm2ForForm3(uid, fm2id);
  },

  /*GET Form3 list by logged-in user*/
  async getForm3ListByUser(uid: number) {
    const form3List = await form3Service.fetchForm3ListByUser(uid);

    // If no records, return empty array
    if (!form3List || form3List.length === 0) {
      return [];
    }

    return form3List;
  },

  /*GET Editable*/
  async getEditableForm3(uid: number) {
    return await form3Service.fetchEditableForm3(uid);
  },

  /*Submit Form3*/
  async submitForm3Usecase(payload: any) {
    const {
      uid,
      form2_id,
      department_id,
      district_id,
      district_name,
      zone_id,
      zone_name,
      remarks,
    } = payload;

    const selected_soc =
      payload.selected_soc ??
      payload.selected_societies ??
      [];

    if (!Array.isArray(selected_soc)) {
      throw new Error("selected_soc must be an array");
    }

    /*Create Form3 parent*/
    const form3Record = await form3Service.createForm3Parent({
      uid,
      form2_id,
      department_id,
      district_id,
      district_name,
      zone_id,
      zone_name,
      remarks,
      selected_soc_count: selected_soc.length,
    });

    /*Insert Form3 societies*/
    await form3Service.insertForm3Societies(
      form3Record.id,
      selected_soc
    );

    /*Build & return response*/
    return form3Service.buildSubmitResponse(form3Record);
  },

  /*PUT Update Form3*/
  async updateForm3Usecase(payload: any) {
    const {
      uid,
      form3_id,
    } = payload;

    if (!form3_id) {
      throw new Error("form3_id is required");
    }

    return await form3Service.updateForm3(
      form3_id,
      uid,
      payload
    );
  },
};
