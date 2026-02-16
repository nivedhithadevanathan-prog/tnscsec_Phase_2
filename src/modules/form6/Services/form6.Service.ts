import { PrismaClient } from "@prisma/client";
import {
  form6_candidate_event_event_type,
  form6_society_decision_election_action,
  form6_society_decision_election_status,
  form6_status,
} from "@prisma/client";
import { cleanText } from "../../../utils/cleanText";

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
  societies: any[];
}

export const Form6Service = {

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

  async loadForm6Preview(uid: number): Promise<Form6ViewResponse> {
    return this._buildForm6View(uid, false);
  },

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
          society_name: cleanText(filedSoc.society_name),
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

    return {
      form4_filed_soc_id,
      society_id: filedSoc.society_id,
      society_name: cleanText(filedSoc.society_name),
      election_action: actionEnum,
    };
  },

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

    return this.loadForm6Preview(uid);
  },

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

    const form4 = await prisma.form4.findFirst({
      where: { uid },
      orderBy: { created_at: "desc" },
    });

    const filedSocieties = form4
      ? await prisma.form4_filed_soc_mem_count.findMany({
          where: { form4_id: form4.id },
        })
      : [];

    const societies = filedSocieties.map((soc) => ({
      form4_filed_soc_id: soc.id,
      society_id: soc.society_id,
      society_name: cleanText(soc.society_name),
    }));

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
