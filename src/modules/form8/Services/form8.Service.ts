import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()
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

  /*FORM5 MEMBERS(PER SOCIETY)*/

 async getMembers(form7_society_id: number) {
  // Get actual society_id from form7_societies
  const society =
    await prisma.form7_societies.findUnique({
      where: { id: form7_society_id },
      select: { society_id: true },
    });

  if (!society) return [];

  // Use society_id to fetch members from form5
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

  if (!district || !district.name) {
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
    const existing =
      await this.getLatestForm8ByDistrict(district_id);

    if (existing) return existing;

    return this.createForm8(district_id);
  },

  /* CHECKBOX PREVIEW*/

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

    (Object.keys(map) as Array<keyof typeof map>).forEach(
      (category) => {
        const allowed = seat_limit[category];
        const categoryMembers =
          members.filter(
            (m) => m.category_type === map[category]
          );

        categoryMembers.forEach((m, index) => {
          const row = {
            form5_member_id: m.id,
            category_type: category,
          };

          index < allowed
            ? selected.push(row)
            : rejected.push(row);
        });
      }
    );

    return {
      form7_society_id,
      seat_limit,
      selected,
      rejected,
    };
  },

  /*FINAL RESULT SAVE (WINNERS + DLG)*/

  async saveFinalResult(data: {
    form8_id: number;
    form7_society_id: number;
    winners: {
      SC_ST?: number[];
      WOMEN?: number[];
      GENERAL?: number[];
      SC_ST_DLG?: number[];
      WOMEN_DLG?: number[];
      GENERAL_DLG?: number[];
    };
  }) {

    // Remove existing winners for this society
    await prisma.form8_final_result.deleteMany({
      where: {
        form8_id: data.form8_id,
        form7_society_id: data.form7_society_id,
      },
    });

    const rows: any[] = [];

    const pushRows = (
      category: form8_final_result_category_type,
      memberIds: number[] = []
    ) => {
      for (const memberId of memberIds) {
        rows.push({
          form8_id: data.form8_id,
          form7_society_id: data.form7_society_id,
          form5_member_id: memberId,
          category_type: category,
        });
      }
    };

    pushRows(
      form8_final_result_category_type.SC_ST,
      data.winners.SC_ST
    );

    pushRows(
      form8_final_result_category_type.WOMEN,
      data.winners.WOMEN
    );

    pushRows(
      form8_final_result_category_type.GENERAL,
      data.winners.GENERAL
    );

    pushRows(
      form8_final_result_category_type.SC_ST_DLG,
      data.winners.SC_ST_DLG
    );

    pushRows(
      form8_final_result_category_type.WOMEN_DLG,
      data.winners.WOMEN_DLG
    );

    pushRows(
      form8_final_result_category_type.GENERAL_DLG,
      data.winners.GENERAL_DLG
    );

    if (rows.length > 0) {
      await prisma.form8_final_result.createMany({
        data: rows,
      });
    }

    return {
      form8_id: data.form8_id,
      total: rows.length,
    };
  },

  /*SUBMIT FORM8 (POLLING DETAILS)*/

  async submitForm8(
    form8_id: number,
    societies: {
      form7_society_id: number;
      polling_details: {
        ballot_votes_at_counting: number;
        valid_votes: number;
        invalid_votes: number;
        remarks?: string;
      };
    }[]
  ) {

    // Ensure final result exists
    const finalResultCount =
      await prisma.form8_final_result.count({
        where: { form8_id },
      });

    if (finalResultCount === 0) {
      throw new Error(
        "Final result not saved. Cannot submit."
      );
    }

    // Save polling details
    for (const soc of societies) {
      await prisma.form8_polling_details.create({
        data: {
          form8_id,
          form7_society_id: soc.form7_society_id,
          ballot_votes_at_counting:
            soc.polling_details.ballot_votes_at_counting,
          valid_votes:
            soc.polling_details.valid_votes,
          invalid_votes:
            soc.polling_details.invalid_votes,
          remarks:
            soc.polling_details.remarks ?? null,
        },
      });
    }

    return {
      form8_id,
      submitted: true,
    };
  },

  /*LIST API SUBMITTED FORM8 DATA*/
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

    /* POLLING DETAILS */
    for (const pd of form8.form8_polling_details) {

      const society = await prisma.form7_societies.findUnique({
        where: { id: pd.form7_society_id },
        select: {
          society_id: true,
          society_name: true,
        },
      });

      if (!society) continue;

      const rural =
        await prisma.form4_filed_soc_mem_count.findFirst({
          where: { society_id: society.society_id },
          orderBy: { id: "desc" },
          select: {
            rural_sc_st: true,
            rural_women: true,
            rural_general: true,
          },
        });

      societyMap.set(pd.form7_society_id, {
        society_id: society.society_id,
        society_name: society.society_name,
        rural: {
          SC_ST: rural?.rural_sc_st ?? 0,
          WOMEN: rural?.rural_women ?? 0,
          GENERAL: rural?.rural_general ?? 0,
        },
        categories: {
          SC_ST: [],
          WOMEN: [],
          GENERAL: [],
          SC_ST_DLG: [],
          WOMEN_DLG: [],
          GENERAL_DLG: [],
        },
        polling_details: {
          ballot_votes_at_counting: pd.ballot_votes_at_counting,
          valid_votes: pd.valid_votes,
          invalid_votes: pd.invalid_votes,
          remarks: pd.remarks,
        },
      });
    }

    /* WINNERS (FINAL RESULT) */
    for (const fr of form8.form8_final_result) {

      const society = societyMap.get(fr.form7_society_id);
      if (!society) continue;

      if (!fr.category_type) continue;
      if (!fr.form5_member_id || fr.form5_member_id === 0) continue;

      const member =
        await prisma.form5.findUnique({
          where: { id: fr.form5_member_id },
          select: {
            id: true,
            member_name: true,
            aadhar_no: true,
          },
        });

      if (!member) continue;

      society.categories[fr.category_type].push({
        form5_member_id: member.id,
        member_name: member.member_name,
        aadhar_no: member.aadhar_no,
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
};
