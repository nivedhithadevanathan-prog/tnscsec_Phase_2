import { PrismaClient } from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";


export const prisma = new PrismaClient();

export const form3Service = {
  /*GET SERVICE Form2 list for Form3*/
  async fetchForm2ForForm3(uid: number | string, fm2id?: number | string) {
    const userId = Number(uid);
    if (Number.isNaN(userId)) {
      throw new Error("Invalid user id");
    }

    const form2Id = fm2id !== undefined ? Number(fm2id) : undefined;

    if (form2Id !== undefined && Number.isNaN(form2Id)) {
      throw new Error("Invalid form2_id");
    }

    const form2List = await prisma.form2.findMany({
      where: {
        uid: userId,
        ...(form2Id !== undefined ? { id: form2Id } : {}),
      },
      orderBy: { id: "desc" },
      select: {
        id: true,
        district_id: true,
        zone_id: true,
        masterzone_count: true,
        selected_soc_count: true,
        form2_selected_soc: {
          select: {
            society_id: true,
            society_name: true,
          },
        },
      },
    });

    if (!form2List || form2List.length === 0) return [];

    return form2List.map((row) => ({
      form2_id: row.id,
      district_id: row.district_id,
      zone_id: row.zone_id,
      masterzone_count: row.masterzone_count,
      selected_soc_count: row.selected_soc_count,
      selected_soc: row.form2_selected_soc.map((s) => ({
        society_id: s.society_id,
        society_name: cleanText(s.society_name),
      })),
    }));
  },

/* GET Form3 list */
async fetchForm3ListByUser(params: { uid: number; role: number }) {

  const { uid, role } = params;

  const where: any = {
    is_active: 1,
    ...(role !== 1 && { uid: uid }), 
  };

  const form3List = await prisma.form3.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      form3_societies: {
        select: {
          id: true,
          society_id: true,
          society_name: true,
          ass_memlist: true,
          ero_claim: true,
          jcount: true,
          rcount: true,
          total: true,
          rural_id: true,
          tot_voters: true,
        },
      },
    },
  });

  return form3List.map((f) => ({
    ...f,
    remarks: cleanText(f.remarks),
    district_name: cleanText(f.district_name),
    zone_name: cleanText(f.zone_name),
    form3_societies: f.form3_societies.map((s) => ({
      ...s,
      society_name: cleanText(s.society_name),
    })),
  }));
},


  /*GET Editable*/
  async fetchEditableForm3(uid: number | string) {
    const userId = Number(uid);

    if (Number.isNaN(userId)) {
      throw new Error("Invalid user id");
    }

    const form3 = await prisma.form3.findFirst({
      where: {
        uid: userId,
        is_active: 1,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        form3_societies: {
          select: {
            id: true,
            society_id: true,
            society_name: true,
            ass_memlist: true,
            ero_claim: true,
            jcount: true,
            rcount: true,
            total: true,
            rural_id: true,
            tot_voters: true,
          },
        },
      },
    });

    if (!form3) return form3;

    return {
      ...form3,
      remarks: cleanText(form3.remarks),
      district_name: cleanText(form3.district_name),
      zone_name: cleanText(form3.zone_name),
      form3_societies: form3.form3_societies.map(s => ({
        ...s,
        society_name: cleanText(s.society_name),
      })),
    };
  },

  /*SUBMIT Create Form3 parent*/
  async createForm3Parent(payload: any) {
    return await prisma.form3.create({
      data: {
        uid: payload.uid,
        department_id: payload.department_id,
        district_id: payload.district_id,
        zone_id: payload.zone_id,
        form2_id: payload.form2_id,
        remarks: cleanText(payload.remarks) ?? null,
        district_name: cleanText(payload.district_name) ?? null,
        zone_name: cleanText(payload.zone_name) ?? null,
        selected_soc_count: payload.selected_soc_count,
      },
    });
  },

  /*SUBMIT Insert societies into form3_societies*/
  async insertForm3Societies(form3_id: number, societies: any[]) {
    if (!societies || societies.length === 0) return;

    const votersData = await prisma.form1_selected_soc.findMany({
      where: {
        society_id: {
          in: societies.map((s) => s.society_id),
        },
      },
      select: {
        society_id: true,
        tot_voters: true,
      },
    });

    const votersMap = new Map(
      votersData.map((v) => [v.society_id, v.tot_voters]),
    );

    await prisma.form3_societies.createMany({
      data: societies.map((soc) => {
        const assMem =
          soc.ass_memlist !== undefined && soc.ass_memlist !== null
            ? Number(soc.ass_memlist)
            : null;

        const eroClaim =
          soc.ero_claim !== undefined && soc.ero_claim !== null
            ? Number(soc.ero_claim)
            : null;

        const jcount = Number(soc.jcount ?? 0);
        const rcount = Number(soc.rcount ?? 0);

        if (
          (assMem !== null && Number.isNaN(assMem)) ||
          (eroClaim !== null && Number.isNaN(eroClaim))
        ) {
          throw new Error("Invalid numeric values in society data");
        }

        return {
          form3_id,
          society_id: Number(soc.society_id),
          society_name: cleanText(soc.society_name),

          ass_memlist: assMem,
          ero_claim: eroClaim,

          jcount,
          rcount,
          total: jcount + rcount,

          rural_id: Number(soc.society_id),
          tot_voters: votersMap.get(soc.society_id) ?? 0,
        };
      }),
    });
  },

  /*PUT Update Form3*/
  async updateForm3(form3_id: number, uid: number, payload: any) {
    const userId = Number(uid);

    if (Number.isNaN(userId)) {
      throw new Error("Invalid user id");
    }

    const existingForm3 = await prisma.form3.findFirst({
      where: {
        id: Number(form3_id),
        uid: userId,
        is_active: 1,
      },
    });

    if (!existingForm3) {
      throw new Error("Form3 is not editable");
    }

    const selected_soc =
      payload.selected_soc ?? payload.selected_societies ?? [];

    if (!Array.isArray(selected_soc)) {
      throw new Error("selected_soc must be an array");
    }

    await prisma.form3.update({
      where: { id: form3_id },
      data: {
        remarks: cleanText(payload.remarks) ?? null,
        selected_soc_count: selected_soc.length,
        updated_at: new Date(),
      },
    });

    await prisma.form3_societies.deleteMany({
      where: { form3_id },
    });

    await this.insertForm3Societies(form3_id, selected_soc);

    return {
      success: true,
      statusCode: 200,
      message: "Form3 updated successfully",
      data: {
        form3_id,
        selected_soc_count: selected_soc.length,
      },
    };
  },

  /*Build Submit Response*/
  buildSubmitResponse(form3: any) {
    return {
      success: true,
      statusCode: 200,
      message: "Form3 submitted successfully",
      data: {
        form3_id: form3.id,
        selected_soc_count: form3.selected_soc_count,
      },
    };
  },
};
