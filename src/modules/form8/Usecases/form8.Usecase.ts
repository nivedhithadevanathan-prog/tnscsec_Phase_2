import { Form8Service } from "../../form8/Services/form8.Service";
import { form5_category_type } from "@prisma/client";

/*PREVIEW API USECASE*/

interface PreviewPayload {
  uid: number;
  district_id: number;
}

export const Form8PreviewUsecase = {
  async preview(payload: PreviewPayload) {
    const { district_id } = payload;

    const societies =
      await Form8Service.getForm7SocietiesByDistrict(district_id);

    const polledSocieties: any[] = [];

    const stoppedElections = {
      RULE_52_18: [] as any[],
      RULE_52A_6: [] as any[],
    };

    for (const soc of societies) {
      const base = {
        form7_society_id: soc.id,
        society_id: soc.society_id,
        society_name: soc.society_name,
        casted_votes_count: soc.casted_votes_count,
        polling_suspension_count: soc.polling_suspension_count,
      };

      if (soc.polling_suspension_count === "RULE_52_18") {
        stoppedElections.RULE_52_18.push(base);
        continue;
      }

      if (soc.polling_suspension_count === "RULE_52A_6") {
        stoppedElections.RULE_52A_6.push(base);
        continue;
      }

      if (soc.polling_suspension_count === "NO_ISSUES") {
        const members =
          await Form8Service.getMembers(soc.id);

        const groupedMembers = {
          SC_ST: [] as any[],
          WOMEN: [] as any[],
          GENERAL: [] as any[],
        };

        for (const m of members) {
          if (m.category_type === form5_category_type.sc_st) {
            groupedMembers.SC_ST.push(m);
          }
          if (m.category_type === form5_category_type.women) {
            groupedMembers.WOMEN.push(m);
          }
          if (m.category_type === form5_category_type.general) {
            groupedMembers.GENERAL.push(m);
          }
        }

        const rural =
          await Form8Service.getRuralCountsBySociety(
            soc.society_id
          );

        polledSocieties.push({
          ...base,
          rural: {
            SC_ST: rural?.rural_sc_st ?? 0,
            WOMEN: rural?.rural_women ?? 0,
            GENERAL: rural?.rural_general ?? 0,
          },
          declared: {
            SC_ST: soc.final_sc_st_count ?? 0,
            WOMEN: soc.final_women_count ?? 0,
            GENERAL: soc.final_general_count ?? 0,
          },
          members: groupedMembers,
        });
      }
    }

    return {
      polled_societies: polledSocieties,
      stopped_elections: stoppedElections,
    };
  },
};

/*CHECKBOX PREVIEW USECASE*/

export const Form8CheckboxUsecase = {
  async checkboxPreview(district_id: number) {
    const societies =
      await Form8Service.getForm7SocietiesByDistrict(district_id);

    const response: any[] = [];

    for (const soc of societies) {
      if (soc.polling_suspension_count !== "NO_ISSUES") continue;

      const members =
        await Form8Service.getMembers(soc.id);

      //FILTER NULL category_type (TS + runtime safe)
     const validMembers = members
  .filter((m) => m.category_type !== null)
  .map((m) => ({
    id: m.id,
    category_type: m.category_type as form5_category_type,
  }));


      const seat_limit = {
        SC_ST: soc.final_sc_st_count ?? 0,
        WOMEN: soc.final_women_count ?? 0,
        GENERAL: soc.final_general_count ?? 0,
        
      };

     const preview =
  Form8Service.buildCheckboxPreview({
    form7_society_id: soc.id,
    members: validMembers,
    seat_limit,
  });


      response.push(preview);
    }

    return response;
  },
};

/*FINAL RESULT SAVE USECASE (WINNERS + DLG)*/

export const Form8FinalResultUsecase = {
  async saveFinalResult(data: {
    uid: number;
    district_id: number;
    payload: {
      form7_society_id: number;
      winners: {
        SC_ST?: number[];
        WOMEN?: number[];
        GENERAL?: number[];
        SC_ST_DLG?: number[];
        WOMEN_DLG?: number[];
        GENERAL_DLG?: number[];
      };
    };
  }) {
    const { district_id, payload } = data;

    const form8 =
      await Form8Service.getOrCreateForm8(district_id);

    const winners = payload.winners;

    const total =
      (winners.SC_ST?.length ?? 0) +
      (winners.WOMEN?.length ?? 0) +
      (winners.GENERAL?.length ?? 0) +
      (winners.SC_ST_DLG?.length ?? 0) +
      (winners.WOMEN_DLG?.length ?? 0) +
      (winners.GENERAL_DLG?.length ?? 0);

    if (total === 0) {
      throw new Error("At least one winner must be selected");
    }

    await Form8Service.saveFinalResult({
      form8_id: form8.id,
      form7_society_id: payload.form7_society_id,
      winners,
    });

    return {
      form8_id: form8.id,
      total,
    };
  },
};

/*SUBMIT FORM8 USECASE (POLLING DETAILS)*/

interface SubmitPayload {
  uid: number;
  district_id: number;
  societies: {
    form7_society_id: number;
    polling_details: {
      ballot_votes_at_counting: number;
      valid_votes: number;
      invalid_votes: number;
      remarks?: string;
    };
  }[];
}

export const Form8SubmitUsecase = {
  async submit(data: SubmitPayload) {
    const { district_id, societies } = data;

    const form8 =
      await Form8Service.getLatestForm8ByDistrict(district_id);

    if (!form8) {
      throw new Error("Form8 not found");
    }

    return await Form8Service.submitForm8(
      form8.id,
      societies
    );
  },
};

/*FORM8 LIST USECASE*/

interface Form8ListPayload {
  uid: number;
  district_id: number;
}

export const Form8ListUsecase = {
  async list(payload: Form8ListPayload) {
    const { district_id } = payload;

    const data =
      await Form8Service.getSubmittedForm8Details(
        district_id
      );

    return Array.isArray(data) ? data : [];
  },
};
