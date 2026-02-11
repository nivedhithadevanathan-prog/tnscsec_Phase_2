import {
  form10_status,
  form10_society_status,
  form10_candidate_status_status,
  form10_society_election_type,
} from "@prisma/client";

export const Form10Service = {

  /* =====================================================
   * FORM10 INIT
   * ===================================================== */

  buildForm10(params: {
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
      status: form10_status.DRAFT,
    };
  },

  buildInitialForm10Society() {
    return {
      election_type: null,
      status: form10_society_status.DRAFT,
    };
  },

  buildInitResponse(params: {
    form10_id: number;
    societies_count: number;
  }) {
    return {
      form10_id: params.form10_id,
      status: form10_status.DRAFT,
      societies_count: params.societies_count,
    };
  },



  /* =====================================================
   * PREVIEW BUILDER
   * ===================================================== */
  buildPreview(params: {
    form4_filed_soc_id: number;
    members: {
      id: number;
      member_name: string;
      aadhar_no: string;
      status?: form10_candidate_status_status | null;
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
        aadhar_no: m.aadhar_no,
        status: m.status ?? null,
      };

      switch (row.status) {

        case null:
          pending.push(row);
          break;

        case form10_candidate_status_status.ELIGIBLE:
          eligible.push(row);
          break;

        case form10_candidate_status_status.REJECTED:
          rejected.push(row);
          break;

        case form10_candidate_status_status.WITHDRAWN:
          withdrawn.push(row);
          break;

        case form10_candidate_status_status.LOST:
          lost.push(row);
          break;

        default:
          pending.push(row);
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

/* =====================================================
   * REJECT
   * ===================================================== */

  buildRejectCandidateStatus(params: {
    form10_id: number;
    form10_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form10_id: params.form10_id,
      form10_society_id: params.form10_society_id,
      form5_member_id: params.form5_member_id,
      status: form10_candidate_status_status.REJECTED,
      remarks: params.remarks ?? null,
    };
  },

  buildRejectResponse(params: {
    rejected_count: number;
  }) {
    return {
      rejected_count: params.rejected_count,
    };
  },

 /* =====================================================
   * WITHDRAW
   * ===================================================== */

  buildWithdrawCandidateStatus(params: {
    form10_id: number;
    form10_society_id: number;
    form5_member_id: number;
    remarks?: string | null;
  }) {
    return {
      form10_id: params.form10_id,
      form10_society_id: params.form10_society_id,
      form5_member_id: params.form5_member_id,
      status: form10_candidate_status_status.WITHDRAWN,
      remarks: params.remarks ?? null,
    };
  },

  buildWithdrawResponse() {
    return null;
  },

/* =====================================================
   * FINAL SOCIETY
   * ===================================================== */

  decideElectionType(activeCandidatesCount: number) {
    if (activeCandidatesCount <= 0) {
      throw {
        statusCode: 400,
        message: "No active candidates found",
      };
    }

    if (activeCandidatesCount === 1) {
      return form10_society_election_type.UNOPPOSED;
    }

    return form10_society_election_type.POLL;
  },

  buildFinalSocietyUpdate(params: {
    election_type: form10_society_election_type;
    vice_president_form5_candidate_id?: number | null;
  }) {
    return {
      status: form10_society_status.FINALIZED,
      election_type: params.election_type,
      vice_president_form5_candidate_id:
        params.vice_president_form5_candidate_id ?? null,
    };
  },

  buildFinalResponse(params: {
    form10_id: number;
    form10_society_id: number;
    election_type: form10_society_election_type;
  }) {
    return {
      form10_id: params.form10_id,
      form10_society_id: params.form10_society_id,
      election_type: params.election_type,
    };
  },

 /* =====================================================
   * SUBMIT
   * ===================================================== */

  buildSubmitForm10Update() {
    return {
      status: form10_status.SUBMITTED,
    };
  },

  buildSubmitResponse() {
    return null;
  },

/* =====================================================
 * LIST (VICE PRESIDENT)
 * ===================================================== */
buildListSociety(params: {
  form10_society_id: number;
  form4_filed_soc_id: number;
  society_id: number;
  society_name: string;
  election_type: any;
  vice_president_winner: {
    form5_member_id: number;
    member_name: string;
    aadhar_no: string;
  } | null;
  is_draft_visible: boolean;
}) {
  return {
    form10_society_id: params.form10_society_id,
    form4_filed_soc_id: params.form4_filed_soc_id,
    society_id: params.society_id,
    society_name: params.society_name,
    election_type: params.election_type,
    vice_president_winner: params.vice_president_winner,
    draft: params.is_draft_visible === true ? false : true,
  };
},

buildListResponse(params: {
  societies: any[];
}) {
  return params.societies;
},


};


