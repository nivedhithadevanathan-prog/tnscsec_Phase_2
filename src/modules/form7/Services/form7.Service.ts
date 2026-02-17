import { PrismaClient } from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";

export const prisma = new PrismaClient();

export const Form7Service = {
  
  /*Get user's district_id*/
  async getUserDistrict(uid: number) {
    return prisma.users.findFirst({
      where: { id: uid },
      select: {
        district_id: true,
      },
    });
  },

  /*Get district details*/
  async getDistrictById(district_id: number) {
    const district = await prisma.district.findFirst({
      where: { id: district_id },
      select: {
        id: true,
        name: true,
        is_active: true,
      },
    });

    if (!district) return null;

    return {
      ...district,
      name: cleanText(district.name),
    };
  },

  /*Get latest SUBMITTED Form6*/
  async getLatestSubmittedForm6(uid: number) {
    return prisma.form6.findFirst({
      where: {
        uid,
        status: "SUBMITTED",
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },

  /*Get societies from Form6*/
  async getForm6Societies(form6_id: number) {
    const societies = await prisma.form6_society_decision.findMany({
      where: { form6_id },
      select: {
        society_id: true,
        society_name: true,
      },
    });

    return societies.map((s) => ({
      society_id: s.society_id,
      society_name: cleanText(s.society_name),
    }));
  },

  /*Get rural voter counts from Form4*/
  async getForm4SocietyCounts(society_id: number) {
    return prisma.form4_filed_soc_mem_count.findFirst({
      where: { society_id },
      select: {
        rural_sc_st: true,
        rural_women: true,
        rural_general: true,
        rural_sc_st_dlg: true,
        rural_women_dlg: true,
        rural_general_dlg: true,
        rural_tot_voters: true,
      },
    });
  },

  /*Get final declared counts from Form6 decision*/
  async getForm6SocietyDecision(
    form6_id: number,
    society_id: number
  ) {
    return prisma.form6_society_decision.findFirst({
      where: {
        form6_id,
        society_id,
      },
      select: {
        final_sc_st_count: true,
        final_women_count: true,
        final_general_count: true,
        final_sc_st_dlg_count: true,
        final_women_dlg_count: true,
        final_general_dlg_count: true,
      },
    });
  },

  /*Get latest active Form3*/
  async getLatestForm3(uid: number) {
    return prisma.form3.findFirst({
      where: {
        uid,
        is_active: 1,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        selected_soc_count: true,
      },
    });
  },

  /*SUBMIT/EDIT*/

  /*Check existing Form7 for district*/
  async getExistingForm7(district_id: number) {
    return prisma.form7.findFirst({
      where: { district_id },
      orderBy: { created_at: "desc" },
    });
  },

  /*Create Form7 parent*/
  async createForm7(data: {
    district_id: number;
    district_name: string;
  }) {
    return prisma.form7.create({
      data: {
        district_id: data.district_id,
district_name: cleanText(data.district_name) ?? "",
      },
    });
  },

  /*Bulk insert Form7 societies*/
  async createForm7Societies(
    form7_id: number,
    societies: {
      society_id: number;
      society_name: string;

      final_sc_st_count: number;
      final_women_count: number;
      final_general_count: number;

      final_sc_st_dlg_count: number;
      final_women_dlg_count: number;
      final_general_dlg_count: number;

      form3_total: number;
      casted_votes_count: number;
      voting_percentage: number;

      ballot_box_count: number;
      stamp_count: number;
      polling_stations_count: number;
      election_officers_count: number;

      polling_suspension_count:
        | "RULE_52_18"
        | "RULE_52A_6"
        | "NO_ISSUES";
    }[]
  ) {
    return prisma.form7_societies.createMany({
      data: societies.map((s) => ({
        form7_id,

        society_id: s.society_id,
        society_name: cleanText(s.society_name) ?? "",

        final_sc_st_count: s.final_sc_st_count,
        final_women_count: s.final_women_count,
        final_general_count: s.final_general_count,

        final_sc_st_dlg_count: s.final_sc_st_dlg_count,
        final_women_dlg_count: s.final_women_dlg_count,
        final_general_dlg_count: s.final_general_dlg_count,

        form3_total: s.form3_total,
        casted_votes_count: s.casted_votes_count,
        voting_percentage: s.voting_percentage,

        ballot_box_count: s.ballot_box_count,
        stamp_count: s.stamp_count,
        polling_stations_count: s.polling_stations_count,
        election_officers_count: s.election_officers_count,

        polling_suspension_count:
          s.polling_suspension_count,
      })),
    });
  },

  /*Delete Form7 societies*/
  async deleteForm7Societies(form7_id: number) {
    return prisma.form7_societies.deleteMany({
      where: { form7_id },
    });
  },

   /*LIST / EDITABLE*/

  /*Get latest Form7 by district*/
  async getLatestForm7ByDistrict(district_id: number) {
    return prisma.form7.findFirst({
      where: { district_id },
      orderBy: { created_at: "desc" },
    });
  },

  /*Get Form7 societies*/
  async getForm7Societies(form7_id: number) {
    const societies = await prisma.form7_societies.findMany({
      where: { form7_id },
      orderBy: { id: "asc" },
    });

    return societies.map((s) => ({
      ...s,
      society_name: cleanText(s.society_name),
    }));
  },
};
