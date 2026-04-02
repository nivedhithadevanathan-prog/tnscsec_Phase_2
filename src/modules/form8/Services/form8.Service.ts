import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

import {
  form5_category_type,
  form8_final_result_category_type,
} from "@prisma/client";

export const Form8Service = {

  /*FORM7 SOCIETIES (BASE DATA)*/
  async getForm7SocietiesByDistrict(district_id: number) {
    return prisma.form7_societies.findMany({
      where: {
        form7: { district_id },
      },
      select: {
        id: true,
        society_id: true,
        society_name: true,
        casted_votes_count: true,
        polling_suspension_count: true,
        final_sc_st_count: true,
        final_women_count: true,
        final_general_count: true,
      },
    });
  },

  /*FORM5 MEMBERS (PER SOCIETY)*/
  async getMembers(form7_society_id: number) {

    const society = await prisma.form7_societies.findUnique({
      where: { id: form7_society_id },
      select: { society_id: true },
    });

    if (!society) return [];

    return prisma.form5.findMany({
      where: {
        form4_filed_soc_id: society.society_id,
        is_active: true,
      },
      select: {
        id: true,
        member_name: true,
        category_type: true,
        aadhar_no: true,
      },
    });
  },

  /*RURAL COUNTS (FORM4)*/
  async getRuralCountsBySociety(society_id: number) {
    return prisma.form4_filed_soc_mem_count.findFirst({
      where: { society_id },
      orderBy: { id: "desc" },
      select: {
        rural_sc_st: true,
        rural_women: true,
        rural_general: true,
      },
    });
  },

  /*FORM8 HELPERS*/
  async getLatestForm8ByDistrict(district_id: number) {
    return prisma.form8.findFirst({
      where: { district_id },
      orderBy: { id: "desc" },
    });
  },

  async createForm8(district_id: number) {
    const district = await prisma.district.findUnique({
      where: { id: district_id },
      select: { name: true },
    });

    if (!district?.name) {
      throw new Error("District name not found");
    }

    return prisma.form8.create({
      data: {
        district_id,
        district_name: district.name,
      },
    });
  },

  async getOrCreateForm8(district_id: number) {
    const existing = await Form8Service.getLatestForm8ByDistrict(district_id);
    if (existing) return existing;

    return Form8Service.createForm8(district_id);
  },

  /*CHECKBOX PREVIEW*/
  buildCheckboxPreview(params: {
    form7_society_id: number;
    members: {
      id: number;
      category_type: form5_category_type;
    }[];
    seat_limit: {
      SC_ST: number;
      WOMEN: number;
      GENERAL: number;
    };
  }) {

    const { form7_society_id, members, seat_limit } = params;

    const selected: any[] = [];
    const rejected: any[] = [];

    const map = {
      SC_ST: form5_category_type.sc_st,
      WOMEN: form5_category_type.women,
      GENERAL: form5_category_type.general,
    };

    (Object.keys(map) as Array<keyof typeof map>).forEach(category => {

      const allowed = seat_limit[category];

      const categoryMembers = members.filter(
        m => m.category_type === map[category]
      );

      categoryMembers.forEach((m, index) => {
        const row = {
          form5_member_id: m.id,
          category_type: category,
        };

        index < allowed ? selected.push(row) : rejected.push(row);
      });
    });

    return {
      form7_society_id,
      seat_limit,
      selected,
      rejected,
    };
  },

  /*FINAL RESULT SAVE*/
  async saveFinalResult(data: {
    form8_id: number;
    form7_society_id: number;
    winners: any;
  }) {

    await prisma.form8_final_result.deleteMany({
      where: {
        form8_id: data.form8_id,
        form7_society_id: data.form7_society_id,
      },
    });

    const rows: any[] = [];

    const pushRows = (category: any, ids: number[] = []) => {
      for (const id of ids) {
        rows.push({
          form8_id: data.form8_id,
          form7_society_id: data.form7_society_id,
          form5_member_id: id,
          category_type: category,
        });
      }
    };

    pushRows(form8_final_result_category_type.SC_ST, data.winners.SC_ST);
    pushRows(form8_final_result_category_type.WOMEN, data.winners.WOMEN);
    pushRows(form8_final_result_category_type.GENERAL, data.winners.GENERAL);
    pushRows(form8_final_result_category_type.SC_ST_DLG, data.winners.SC_ST_DLG);
    pushRows(form8_final_result_category_type.WOMEN_DLG, data.winners.WOMEN_DLG);
    pushRows(form8_final_result_category_type.GENERAL_DLG, data.winners.GENERAL_DLG);

    if (rows.length) {
      await prisma.form8_final_result.createMany({ data: rows });
    }

    return { form8_id: data.form8_id, total: rows.length };
  },

  /*SUBMIT FORM8*/
  async submitForm8(form8_id: number, societies: any[]) {

    const count = await prisma.form8_final_result.count({
      where: { form8_id },
    });

    if (!count) {
      throw new Error("Final result not saved");
    }

    for (const soc of societies) {
      await prisma.form8_polling_details.create({
        data: {
          form8_id,
          form7_society_id: soc.form7_society_id,
          ballot_votes_at_counting: soc.polling_details.ballot_votes_at_counting,
          valid_votes: soc.polling_details.valid_votes,
          invalid_votes: soc.polling_details.invalid_votes,
          remarks: soc.polling_details.remarks ?? null,
        },
      });
    }

    return { form8_id, submitted: true };
  },

  /*CORE LIST BUILDER*/
  async getSubmittedForm8Details(district_id: number) {

    const form8List = await prisma.form8.findMany({
      where: { district_id },
      orderBy: { id: "desc" },
      include: {
        form8_final_result: true,
        form8_polling_details: true,
      },
    });

    const result: any[] = [];

    for (const form8 of form8List) {

      const societyMap = new Map<number, any>();

      for (const pd of form8.form8_polling_details) {

        const society = await prisma.form7_societies.findUnique({
          where: { id: pd.form7_society_id },
          select: { society_id: true, society_name: true },
        });

        if (!society) continue;

        const rural = await prisma.form4_filed_soc_mem_count.findFirst({
          where: { society_id: society.society_id },
          orderBy: { id: "desc" },
        });

        societyMap.set(pd.form7_society_id, {
          society_id: society.society_id,
          society_name: society.society_name,
          rural,
          categories: {
            SC_ST: [],
            WOMEN: [],
            GENERAL: [],
            SC_ST_DLG: [],
            WOMEN_DLG: [],
            GENERAL_DLG: [],
          },
          polling_details: pd,
        });
      }
for (const fr of form8.form8_final_result) {

  const soc = societyMap.get(fr.form7_society_id);

  if (!soc) continue;
  if (!fr.form5_member_id) continue;
  if (!fr.category_type) continue; 

  const member = await prisma.form5.findUnique({
    where: { id: fr.form5_member_id },
  });

  if (!member) continue;

  soc.categories[fr.category_type].push({
    id: member.id,
    name: member.member_name,
  });
}

      result.push({
        form8_id: form8.id,
        district_name: form8.district_name,
        societies: Array.from(societyMap.values()),
      });
    }

    return result;
  },

  /*FINAL LIST API*/
  async listForm8(params: { uid: number; role: number }) {

    const { uid, role } = params;

    // ADMIN
    if (role === 1) {
      const form8 = await prisma.form8.findFirst({
        orderBy: { id: "desc" },
      });

      if (!form8) return [];

      return Form8Service.getSubmittedForm8Details(form8.district_id);
    }

    // JRCS (multi-zone)
    if (role === 4) {

      const user = await prisma.users.findFirst({
        where: { id: uid },
        select: { zone_id: true },
      });

      if (!user?.zone_id) return [];

      let zoneIds: number[] = [];

      try {
        zoneIds = JSON.parse(user.zone_id);
      } catch {
        return [];
      }

      const districts = await prisma.district.findMany({
        where: { zone_id: { in: zoneIds } },
        select: { id: true },
      });

      let result: any[] = [];

      for (const d of districts) {
        const data = await Form8Service.getSubmittedForm8Details(d.id);
        result.push(...data);
      }

      return result;
    }

    // NORMAL USER
    const user = await prisma.users.findFirst({
      where: { id: uid },
      select: { district_id: true },
    });

    if (!user?.district_id) {
      throw { statusCode: 400, message: "User district not found" };
    }

    return Form8Service.getSubmittedForm8Details(user.district_id);
  },
};