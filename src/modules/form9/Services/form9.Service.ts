import {
  form9_status,
  form9_society_status,
  form9_candidate_status_status,
  form9_society_election_type,
} from "@prisma/client";

export const Form9Service = {

  /*PREVIEW BUILDER*/
  buildPreview(params: {
    form4_filed_soc_id: number;
    members: {
      id: number;
      member_name: string;
      aadhar_no: string;
      status?: form9_candidate_status_status | null;
    }[];
  }) {
    const pending: any[] = [];
    const eligible: any[] = [];
    const rejected: any[] = [];
    const withdrawn: any[] = [];
    const lost: any[] = [];

    params.members.forEach(m => {
      const row = {
        form5_member_id: m.id,
        member_name: m.member_name,
        aadhaar_name: m.aadhar_no,
        status: m.status ?? null,
      };

      switch (row.status) {
        case null:
          pending.push(row);
          break;

        case form9_candidate_status_status.ELIGIBLE:
          eligible.push(row);
          break;

        case form9_candidate_status_status.REJECTED:
          rejected.push(row);
          break;

        case form9_candidate_status_status.WITHDRAWN:
          withdrawn.push(row);
          break;

        case form9_candidate_status_status.LOST:
          lost.push(row);
          break;
      }
    });

    return {
      form4_filed_soc_id: params.form4_filed_soc_id,
      pending,
      eligible,
      rejected,
      withdrawn,
      lost,
    };
  },

  /*FORM9 INIT*/
 buildForm9(params: {
  uid: number;
  district_id: number | null;
  zone_id?: number | null;
  department_id?: number | null;
}) {

    return {
      uid: params.uid,
      district_id: params.district_id ?? null,
      zone_id: params.zone_id ?? null,
      department_id: params.department_id ?? null,
      status: form9_status.DRAFT,
    };
  },

  buildInitialForm9Society() {
  return {
    election_type: null,
    status: form9_society_status.DRAFT,
  };
},


  buildInitResponse(params: {
    form9_id: number;
    societies_count: number;
  }) {
    return {
      form9_id: params.form9_id,
      status: form9_status.DRAFT,
      societies_count: params.societies_count,
    };
  },

  /*REJECT*/
  buildRejectCandidateStatus(params: {
    form9_id: number;
    form9_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form9_id: params.form9_id,
      form9_society_id: params.form9_society_id,
      form5_member_id: params.form5_member_id,
      status: form9_candidate_status_status.REJECTED,
      remarks: params.remarks ?? null,
    };
  },

  buildRejectResponse() {
    return null;
  },

  /*WITHDRAW*/
  buildWithdrawCandidateStatus(params: {
    form9_id: number;
    form9_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form9_id: params.form9_id,
      form9_society_id: params.form9_society_id,
      form5_member_id: params.form5_member_id,
      status: form9_candidate_status_status.WITHDRAWN,
      remarks: params.remarks ?? null,
    };
  },

  buildWithdrawResponse() {
    return null;
  },

  /*FINAL SOCIETY*/
  decideElectionType(activeCandidatesCount: number) {
    if (activeCandidatesCount <= 0) {
      throw {
        statusCode: 400,
        message: "No active candidates found",
      };
    }

    if (activeCandidatesCount === 1) {
      return form9_society_election_type.UNOPPOSED;
    }

    return form9_society_election_type.POLL;
  },

  buildFinalSocietyUpdate(params: {
    election_type: form9_society_election_type;
    president_form5_candidate_id?: number | null;
  }) {
    return {
      status: form9_society_status.FINALIZED,
      election_type: params.election_type,
      president_form5_candidate_id:
        params.president_form5_candidate_id ?? null,
    };
  },

  buildFinalResponse(params: {
    form9_id: number;
    form9_society_id: number;
    election_type: form9_society_election_type;
  }) {
    return {
      form9_id: params.form9_id,
      form9_society_id: params.form9_society_id,
      election_type: params.election_type,
    };
  },

  /*SUBMIT*/
  buildSubmitForm9Update() {
    return {
      status: form9_status.SUBMITTED,
    };
  },

  buildSubmitResponse() {
    return null;
  },

  /*LIST (WINNERS)*/
  buildListSociety(params: {
    form9_society_id: number;
    form4_filed_soc_id: number;
    society_id: number;
    society_name: string;
    election_type: form9_society_election_type;
    president_winner: {
      form5_member_id: number;
      member_name: string;
      aadhar_no: string;
    } | null;
    is_draft_visible: boolean;
  }) {
    return {
      form9_society_id: params.form9_society_id,
      form4_filed_soc_id: params.form4_filed_soc_id,
      society_id: params.society_id,
      society_name: params.society_name,
      election_type: params.election_type,
      president_winner: params.president_winner,
      draft: params.is_draft_visible === true ? false : true,
    };
  },

  buildListResponse(params: {
    societies: any[];
  }) {
    return params.societies;
  },

};
