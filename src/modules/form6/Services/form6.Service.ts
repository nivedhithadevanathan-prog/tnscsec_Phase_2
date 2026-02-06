import { PrismaClient } from "@prisma/client";
import {
  form6_candidate_event_event_type,
  form6_society_decision_election_action,
  form6_society_decision_election_status,
  form6_status,
} from "@prisma/client";

export const prisma = new PrismaClient();


export interface Form6ViewResponse {
  form6: {
    id: number;
    status: form6_status | null;
    created_at: Date;
    submitted_at: Date | null;
  };
  userMeta: {
    uid: number;
    department_id: number | null;
    district_id: number | null;
    zone_id: number | null;
    fullname?: string;
  };
  societies: any[]; // keep any if structure is already stable
}



export const Form6Service = {

  /* =====================================================
   * 1️⃣ INIT FORM-6
   * ===================================================== */
  async initForm6(uid: number) {
    let form6 = await prisma.form6.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form6) {
      const user = await prisma.users.findFirst({
        where: { id: uid },
        select: {
          department_id: true,
          district_id: true,
          zone_id: true,
        },
      });

      if (!user) throw new Error("User not found");

      form6 = await prisma.form6.create({
        data: {
          uid,
          department_id: user.department_id,
          district_id: user.district_id,
          zone_id: user.zone_id ? Number(user.zone_id) : null,
          status: form6_status.DRAFT,
        },
      });
    }

    return {
      id: form6.id,
      status: form6.status,
      created_at: form6.created_at,
      submitted_at: form6.submitted_at,
    };
  },

  /* =====================================================
   * 2️⃣ PREVIEW FORM-6 (LIVE VIEW)
   * ===================================================== */
  async loadForm6Preview(uid: number): Promise<Form6ViewResponse> {
  return this._buildForm6View(uid, false);
},


 

  /* =====================================================
   * 4️⃣ LIST FORM-6 (SUBMITTED)
   * ===================================================== */
  async listForm6(uid: number) {
    const forms = await prisma.form6.findMany({
      where: {
        uid,
        status: form6_status.SUBMITTED,
      },
      orderBy: { submitted_at: "desc" },
      include: {
        form6_society_decision: {
          select: { election_status: true },
        },
      },
    });

    return forms.map((f) => ({
      form6_id: f.id,
      status: f.status,
      created_at: f.created_at,
      submitted_at: f.submitted_at,
      total_societies: f.form6_society_decision.length,
      qualified_societies: f.form6_society_decision.filter(
        d => d.election_status === form6_society_decision_election_status.QUALIFIED
      ).length,
      unqualified_societies: f.form6_society_decision.filter(
        d => d.election_status === form6_society_decision_election_status.UNQUALIFIED
      ).length,
      unopposed_societies: f.form6_society_decision.filter(
        d => d.election_status === form6_society_decision_election_status.UNOPPOSED
      ).length,
    }));
  },

  /* =====================================================
   * 5️⃣ CANDIDATE WITHDRAW
   * ===================================================== */
  async withdrawCandidate(payload: {
    uid: number;
    form4_filed_soc_id: number;
    form5_member_id: number;
  }) {
    const { uid, form4_filed_soc_id, form5_member_id } = payload;

    const form6 = await prisma.form6.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form6) throw new Error("Form6 not initialized");
    if (form6.status !== form6_status.DRAFT)
      throw new Error("Form6 already submitted");

    const lastEvent = await prisma.form6_candidate_event.findFirst({
      where: { form6_id: form6.id, form5_member_id },
      orderBy: { event_at: "desc" },
    });

    if (lastEvent?.event_type === form6_candidate_event_event_type.WITHDRAW) {
      return { message: "Candidate already withdrawn" };
    }

    await prisma.form6_candidate_event.create({
      data: {
        form6_id: form6.id,
        form5_member_id,
        event_type: form6_candidate_event_event_type.WITHDRAW,
        event_by: uid,
      },
    });

    return { withdrawn_member_id: form5_member_id };
  },

  /* =====================================================
   * 6️⃣ SOCIETY DECISION (SHOW / STOP)
   * + COUNTS + ELECTION STATUS
   * ===================================================== */
  async societyDecision(payload: {
    uid: number;
    form4_filed_soc_id: number;
    election_action: "SHOW" | "STOP";
  }) {
    const { uid, form4_filed_soc_id, election_action } = payload;

    const form6 = await prisma.form6.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form6) throw new Error("Form6 not initialized");
    if (form6.status !== form6_status.DRAFT)
      throw new Error("Form6 already submitted");

    const actionEnum =
      election_action === "STOP"
        ? form6_society_decision_election_action.STOP
        : form6_society_decision_election_action.SHOW;

    const filedSoc = await prisma.form4_filed_soc_mem_count.findFirst({
      where: { id: form4_filed_soc_id },
      select: { society_id: true, society_name: true },
    });

    if (!filedSoc) throw new Error("Invalid Form4 filed society");

    let decision = await prisma.form6_society_decision.findFirst({
      where: { form6_id: form6.id, form4_filed_soc_id },
    });

    if (!decision) {
      decision = await prisma.form6_society_decision.create({
        data: {
          form6_id: form6.id,
          form4_filed_soc_id,
          society_id: filedSoc.society_id,
          society_name: filedSoc.society_name,
          election_action: actionEnum,
        },
      });
    } else {
      await prisma.form6_society_decision.update({
        where: { id: decision.id },
        data: {
          election_action: actionEnum,
          updated_at: new Date(),
        },
      });
    }

    /* ---------- Recalculate counts ---------- */
    const members = await prisma.form5.findMany({
      where: { form4_filed_soc_id, is_active: true },
      select: { id: true, category_type: true },
    });

    const events = await prisma.form6_candidate_event.findMany({
      where: {
        form6_id: form6.id,
        form5_member_id: { in: members.map(m => m.id) },
      },
      orderBy: { event_at: "desc" },
    });

    const withdrawn = new Set<number>();
    const seen = new Set<number>();

    for (const e of events) {
      if (!seen.has(e.form5_member_id)) {
        seen.add(e.form5_member_id);
        if (e.event_type === form6_candidate_event_event_type.WITHDRAW) {
          withdrawn.add(e.form5_member_id);
        }
      }
    }

    let sc_st = 0, sc_st_dlg = 0;
    let women = 0, women_dlg = 0;
    let general = 0, general_dlg = 0;

    for (const m of members) {
      if (withdrawn.has(m.id)) continue;

      if (m.category_type === "sc_st") sc_st++;
      else if (m.category_type === "sc_st_dlg") sc_st_dlg++;
      else if (m.category_type === "women") women++;
      else if (m.category_type === "women_dlg") women_dlg++;
      else if (m.category_type === "general") general++;
      else if (m.category_type === "general_dlg") general_dlg++;
    }

    const total =
      sc_st + sc_st_dlg + women + women_dlg + general + general_dlg;

    let election_status =
      total === 0
        ? form6_society_decision_election_status.UNQUALIFIED
        : total === 1
        ? form6_society_decision_election_status.UNOPPOSED
        : form6_society_decision_election_status.QUALIFIED;

    await prisma.form6_society_decision.update({
      where: { id: decision.id },
      data: {
        final_sc_st_count: sc_st,
        final_sc_st_dlg_count: sc_st_dlg,
        final_women_count: women,
        final_women_dlg_count: women_dlg,
        final_general_count: general,
        final_general_dlg_count: general_dlg,
        final_total_count: total,
        election_status,
        updated_at: new Date(),
      },
    });

    return {
      form4_filed_soc_id,
      society_id: filedSoc.society_id,
      society_name: filedSoc.society_name,
      election_action: actionEnum,
      election_status,
      counts: {
        sc_st,
        sc_st_dlg,
        women,
        women_dlg,
        general,
        general_dlg,
        total,
      },
    };
  },

  /* =====================================================
   * 7️⃣ EDIT FORM-6 (AFTER SUBMIT, BEFORE CONFIRM)
   * ===================================================== */
  async editForm6(payload: {
    uid: number;
    societies: { form4_filed_soc_id: number; election_action: "SHOW" | "STOP" }[];
  }) {
    const { uid, societies } = payload;

    const form6 = await prisma.form6.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form6) throw new Error("Form6 not found");
    if (form6.status !== form6_status.SUBMITTED)
      throw new Error("Only submitted Form6 can be edited");

    for (const s of societies) {
      await prisma.form6_society_decision.updateMany({
        where: {
          form6_id: form6.id,
          form4_filed_soc_id: s.form4_filed_soc_id,
        },
        data: {
          election_action:
            s.election_action === "STOP"
              ? form6_society_decision_election_action.STOP
              : form6_society_decision_election_action.SHOW,
          updated_at: new Date(),
        },
      });
    }

    return {
      form6_id: form6.id,
      updated_societies: societies.length,
      status: form6.status,
    };
  },

  /* =====================================================
   * 8️⃣ SUBMIT FORM-6
   * ===================================================== */
  async submitForm6(uid: number) {
    const form6 = await prisma.form6.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    if (!form6) throw new Error("Form6 not initialized");
    if (form6.status !== form6_status.DRAFT)
      throw new Error("Form6 already submitted");

    const decisionCount = await prisma.form6_society_decision.count({
      where: { form6_id: form6.id },
    });

    if (decisionCount === 0)
      throw new Error("No society decision found. Cannot submit Form6");

    const updated = await prisma.form6.update({
      where: { id: form6.id },
      data: {
        status: form6_status.SUBMITTED,
        submitted_at: new Date(),
      },
    });

    return {
      form6_id: updated.id,
      status: updated.status,
      submitted_at: updated.submitted_at,
    };
  },

/* =====================================================
 * EDITABLE FORM-6 (AFTER SUBMIT)
 * ===================================================== */
async getEditableForm6(uid: number) {
  const form6 = await prisma.form6.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  if (!form6) {
    throw new Error("Form6 not found");
  }

  if (form6.status !== "SUBMITTED") {
    throw new Error("Form6 is not submitted yet");
  }

  // Reuse preview logic (safe & DRY)
  return this.loadForm6Preview(uid);
},


  /* =====================================================
   * INTERNAL HELPER (shared preview/editable)
   * ===================================================== */
 async _buildForm6View(uid: number, allowSubmitted: boolean) {

  const form6 = await prisma.form6.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  if (!form6) throw new Error("Form6 not found");

  if (!allowSubmitted && form6.status !== form6_status.DRAFT) {
    throw new Error("Form6 already submitted");
  }

  if (allowSubmitted && form6.status !== form6_status.SUBMITTED) {
    throw new Error("Form6 not submitted yet");
  }

  // -----------------------------
  // 👇 THIS PART WAS MISSING
  // -----------------------------

  const form4 = await prisma.form4.findFirst({
    where: { uid },
    orderBy: { created_at: "desc" },
  });

  const filedSocieties = form4
    ? await prisma.form4_filed_soc_mem_count.findMany({
        where: { form4_id: form4.id },
      })
    : [];

  // members, events, decisionMap, withdrawn logic...
  // build `societies` array EXACTLY like your preview API

const societies = filedSocieties.map((soc) => ({
  form4_filed_soc_id: soc.id,
  society_id: soc.society_id,
  society_name: soc.society_name,
}));
  // -----------------------------
  // ✅ NOW societies EXISTS
  // -----------------------------

  return {
    form6: {
      id: form6.id,
      status: form6.status,
      created_at: form6.created_at,
      submitted_at: form6.submitted_at,
    },
    userMeta: {
      uid,
      department_id: form6.department_id,
      district_id: form6.district_id,
      zone_id: form6.zone_id,
    },
    societies,
  };
}
};