import { PrismaClient } from "@prisma/client";
import { Form7Service } from "../../form7/Services/form7.Service";



export const prisma = new PrismaClient();

export const Form7Usecase = {
  /*PREVIEW FORM7*/
  async preview(uid: number) {
    const user = await Form7Service.getUserDistrict(uid);
    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const districtId: number = user.district_id;

    const district = await Form7Service.getDistrictById(districtId);
    if (!district) {
      throw { statusCode: 400, message: "District not found" };
    }

    const form6 = await Form7Service.getLatestSubmittedForm6(uid);
    if (!form6) {
      throw { statusCode: 400, message: "Form6 not submitted yet" };
    }

    const form6Societies =
      await Form7Service.getForm6Societies(form6.id);

    const form3 = await Form7Service.getLatestForm3(uid);
    if (!form3) {
      throw { statusCode: 400, message: "Form3 data not available" };
    }

    const societies: any[] = [];

    for (const soc of form6Societies) {
      const rural =
        await Form7Service.getForm4SocietyCounts(
          soc.society_id
        );

      const decision =
        await Form7Service.getForm6SocietyDecision(
          form6.id,
          soc.society_id
        );

      const ruralSc = rural?.rural_sc_st ?? 0;
      const ruralWomen = rural?.rural_women ?? 0;
      const ruralGeneral = rural?.rural_general ?? 0;
      const ruralTotal = rural?.rural_tot_voters ?? 0;

      const declaredSc = decision?.final_sc_st_count ?? 0;
      const declaredWomen = decision?.final_women_count ?? 0;
      const declaredGeneral = decision?.final_general_count ?? 0;

      const dlgSc = decision?.final_sc_st_dlg_count ?? 0;
      const dlgWomen = decision?.final_women_dlg_count ?? 0;
      const dlgGeneral = decision?.final_general_dlg_count ?? 0;

      societies.push({
        society_id: soc.society_id,
        society_name: soc.society_name,

        rural: {
          sc_st: ruralSc,
          women: ruralWomen,
          general: ruralGeneral,
          total_voters: ruralTotal,
        },

        declared: {
          sc_st: declaredSc,
          women: declaredWomen,
          general: declaredGeneral,
        },

        dlg_declared: {
          sc_st: dlgSc,
          women: dlgWomen,
          general: dlgGeneral,
        },

        qualified_categories: {
          sc_st: {
            eligible: declaredSc > ruralSc,
            count: Math.max(declaredSc - ruralSc, 0),
          },
          women: {
            eligible: declaredWomen > ruralWomen,
            count: Math.max(declaredWomen - ruralWomen, 0),
          },
          general: {
            eligible: declaredGeneral > ruralGeneral,
            count: Math.max(declaredGeneral - ruralGeneral, 0),
          },
        },
      });
    }

    return {
      district: {
        id: districtId,
        name: district.name ?? "",
      },
      form3_total: form3.selected_soc_count ?? 0,
      societies,
    };
  },

  /*SUBMIT FORM7*/
  async submit(payload: any) {
  const { uid, societies: inputSocieties } = payload;

  const user = await Form7Service.getUserDistrict(uid);
  if (user?.district_id == null) {
    throw { statusCode: 400, message: "User district not found" };
  }

  const districtId = user.district_id;

  const district = await Form7Service.getDistrictById(districtId);
  if (!district) {
    throw { statusCode: 400, message: "District not found" };
  }

  const existing =
    await Form7Service.getExistingForm7(districtId);
  if (existing) {
    throw {
      statusCode: 400,
      message: "Form7 already submitted for this district",
    };
  }

  const form6 = await Form7Service.getLatestSubmittedForm6(uid);
  if (!form6) {
    throw { statusCode: 400, message: "Form6 not submitted yet" };
  }

  const form6Societies =
    await Form7Service.getForm6Societies(form6.id);

  const form3 = await Form7Service.getLatestForm3(uid);
  if (!form3) {
    throw { statusCode: 400, message: "Form3 data not available" };
  }

  const snapshot: any[] = [];

  for (const soc of form6Societies) {
    const decision =
      await Form7Service.getForm6SocietyDecision(
        form6.id,
        soc.society_id
      );

    const rural =
      await Form7Service.getForm4SocietyCounts(
        soc.society_id
      );

    const input = inputSocieties.find(
      (i: any) => i.society_id === soc.society_id
    );
    if (!input) {
      throw {
        statusCode: 400,
        message: `Missing input for society ${soc.society_name}`,
      };
    }

    const ruralSc = rural?.rural_sc_st ?? 0;
    const ruralWomen = rural?.rural_women ?? 0;
    const ruralGeneral = rural?.rural_general ?? 0;

    const declaredSc = decision?.final_sc_st_count ?? 0;
    const declaredWomen = decision?.final_women_count ?? 0;
    const declaredGeneral = decision?.final_general_count ?? 0;

    snapshot.push({
      society_id: soc.society_id,
      society_name: soc.society_name,

      final_sc_st_count: declaredSc,
      final_women_count: declaredWomen,
      final_general_count: declaredGeneral,

      final_sc_st_dlg_count:
        declaredSc > ruralSc ? declaredSc - ruralSc : 0,

      final_women_dlg_count:
        declaredWomen > ruralWomen ? declaredWomen - ruralWomen : 0,

      final_general_dlg_count:
        declaredGeneral > ruralGeneral
          ? declaredGeneral - ruralGeneral
          : 0,

      form3_total: form3.selected_soc_count ?? 0,
      casted_votes_count: input.casted_votes_count,
      voting_percentage: input.voting_percentage,

      ballot_box_count: input.ballot_box_count,
      stamp_count: input.stamp_count,
      polling_stations_count: input.polling_stations_count,
      election_officers_count: input.election_officers_count,

      polling_suspension_count:
        input.polling_suspension_count ?? "NO_ISSUES",
    });
  }

  return prisma.$transaction(async () => {
    const form7 =
      await Form7Service.createForm7({
        district_id: districtId,
        district_name: district.name ?? "",
      });

    await Form7Service.createForm7Societies(
      form7.id,
      snapshot
    );

    return {
      form7_id: form7.id,
      district_id: districtId,
      societies_count: snapshot.length,
    };
  });
},

/* LIST FORM7 */
/* LIST FORM7 */
async list(params: { 
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

  // 🔹 ADMIN → latest Form7
  if (role === 1) {
    const form7 = await prisma.form7.findFirst({
      orderBy: { created_at: "desc" },
    });

    return form7 ? [form7] : [];
  }

  // 🔹 JRCS → ALL districts in their zones
  else if (role === 4) {

    const districts = await prisma.district.findMany({
      where: {
        zone_id: { in: zoneIds },
      },
      select: { id: true },
    });

    const districtIds = districts.map((d) => d.id);

    const form7List = await prisma.form7.findMany({
      where: {
        district_id: { in: districtIds },
      },
      orderBy: { created_at: "desc" },
    });

    return form7List;
  }

  // 🔹 NORMAL USER → district-based
  else {
    const user = await Form7Service.getUserDistrict(uid);

    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const form7 =
      await Form7Service.getLatestForm7ByDistrict(user.district_id);

    return form7 ? [form7] : [];
  }
},

  /*EDITABLE FORM7*/
  async editable(uid: number) {
    const user = await Form7Service.getUserDistrict(uid);
    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const form7 =
      await Form7Service.getLatestForm7ByDistrict(
        user.district_id
      );

    if (!form7) {
      throw { statusCode: 400, message: "Form7 not submitted yet" };
    }

    const societies =
      await Form7Service.getForm7Societies(form7.id);

    return { form7, societies };
  },

  /*EDIT FORM7*/
  async edit(payload: any) {
    const { uid, societies: inputSocieties } = payload;

    const user = await Form7Service.getUserDistrict(uid);
    if (user?.district_id == null) {
      throw { statusCode: 400, message: "User district not found" };
    }

    const form7 =
      await Form7Service.getLatestForm7ByDistrict(
        user.district_id
      );
    if (!form7) {
      throw { statusCode: 400, message: "Form7 not found" };
    }

    await Form7Service.deleteForm7Societies(form7.id);

    await Form7Service.createForm7Societies(
      form7.id,
      inputSocieties.map((s: any) => ({
        ...s,
        final_sc_st_dlg_count: s.final_sc_st_dlg_count ?? 0,
        final_women_dlg_count: s.final_women_dlg_count ?? 0,
        final_general_dlg_count: s.final_general_dlg_count ?? 0,
        polling_suspension_count:
          s.polling_suspension_count ?? "NO_ISSUES",
      }))
    );

    return {
      form7_id: form7.id,
      societies_count: inputSocieties.length,
    };
  },
};
