import { PrismaClient } from "@prisma/client";
import { Form10Service } from "../../form10/Services/form10.Service";
import { form10_status } from "@prisma/client";
import { form10_candidate_status_status } from "@prisma/client";
import { form10_society_status } from "@prisma/client";



const prisma = new PrismaClient();

export const Form10Usecase = {

  /*INIT*/
  async init(uid: number | string) {

    const userId = Number(uid);

    if (!userId) {
      throw { statusCode: 400, message: "Invalid user id" };
    }

    //Validate user & fetch mapping
    const user = await prisma.users.findFirst({
      where: { id: userId },
      select: {
        district_id: true,
        zone_id: true,
        department_id: true,
      },
    });

    if (!user?.district_id) {
      throw { statusCode: 400, message: "User district not found" };
    }

    //Check existing draft
    const existing = await prisma.form10.findFirst({
      where: {
        uid: userId,
        status: form10_status.DRAFT,
      },
    });

    if (existing) {
      return Form10Service.buildInitResponse({
        form10_id: existing.id,
        societies_count: 0,
      });
    }

    //Fetch societies
    const societies = await prisma.form4_filed_soc_mem_count.findMany({
      select: { id: true },
    });

    if (!societies.length) {
      throw { statusCode: 400, message: "No societies found" };
    }

    //Transaction
    return await prisma.$transaction(async (tx) => {

      const form10 = await tx.form10.create({
        data: Form10Service.buildForm10({
          uid: userId,
          district_id: user.district_id,
          zone_id: user.zone_id ? Number(user.zone_id) : null,
          department_id: user.department_id,
        }),
      });

      let count = 0;

      for (const soc of societies) {
        await tx.form10_society.create({
          data: {
            ...Form10Service.buildInitialForm10Society(),
            form10: { connect: { id: form10.id } },
            form4_filed_soc_mem_count: { connect: { id: soc.id } },
          },
        });

        count++;
      }

      return Form10Service.buildInitResponse({
        form10_id: form10.id,
        societies_count: count,
      });
    });
  },

  /*PREVIEW*/
  async preview(uid: number) {

    //Validate user
    const user = await prisma.users.findFirst({
      where: { id: uid },
      select: { district_id: true },
    });

    if (!user?.district_id) {
      throw { statusCode: 400, message: "User district not found" };
    }

    //Fetch societies
    const societies = await prisma.form4_filed_soc_mem_count.findMany({
      select: {
        id: true,
        society_id: true,
        society_name: true,
      },
    });

    const response: any[] = [];

    for (const soc of societies) {

      /*Fetch President from Form9 (Exclude Them)*/
      const president = await prisma.form9_society.findFirst({
        where: {
          form4_filed_soc_id: soc.id,
          status: "FINALIZED",
        },
        select: {
          president_form5_candidate_id: true,
        },
      });

      const presidentId = president?.president_form5_candidate_id ?? null;

      /*Fetch Active Members (Exclude President)*/
      const members = await prisma.form5.findMany({
        where: {
          form4_filed_soc_id: soc.id,
          is_active: true,
          ...(presidentId && {
            id: { not: presidentId },
          }),
        },
        select: {
          id: true,
          member_name: true,
          aadhar_no: true,
        },
      });

      /*Fetch Candidate Statuses (Form10)*/
      const statuses = await prisma.form10_candidate_status.findMany({
        where: {
          form10_society: {
            form4_filed_soc_id: soc.id,
          },
        },
        select: {
          form5_member_id: true,
          status: true,
        },
      });

      const statusMap = new Map(
        statuses.map(s => [s.form5_member_id, s.status ?? null])
      );

      /*Build Preview*/
      const preview = Form10Service.buildPreview({
        form4_filed_soc_id: soc.id,
        members: members.map(m => ({
          id: m.id,
          member_name: m.member_name,
          aadhar_no: m.aadhar_no,
          status: statusMap.get(m.id) ?? null,
        })),
      });

      response.push({
        society_id: soc.society_id,
        society_name: soc.society_name,
        ...preview,
      });
    }

    return response;
  },

/*REJECT*/
  async reject(params: {
    uid: number;
    form10_id: number;
    form10_society_id: number;
    candidates: {
      form5_member_id: number;
      remarks?: string;
    }[];
  }) {

    const { uid, form10_id, form10_society_id, candidates } = params;

    /*Validate Form10 ownership + DRAFT status*/
    const form10 = await prisma.form10.findFirst({
      where: { id: form10_id, uid },
      select: { status: true },
    });

    if (!form10) {
      throw { statusCode: 404, message: "Form10 not found" };
    }

    if (form10.status !== form10_status.DRAFT) {
      throw { statusCode: 400, message: "Form10 not editable" };
    }

    /*Validate Society belongs to Form10*/
    const society = await prisma.form10_society.findFirst({
      where: { id: form10_society_id, form10_id },
      select: { form4_filed_soc_id: true },
    });

    if (!society) {
      throw { statusCode: 404, message: "Form10 society not found" };
    }

    /*Fetch President from Form9 (Exclude Them)*/
    const president = await prisma.form9_society.findFirst({
      where: {
        form4_filed_soc_id: society.form4_filed_soc_id,
        status: "FINALIZED",
      },
      select: {
        president_form5_candidate_id: true,
      },
    });

    const presidentId = president?.president_form5_candidate_id ?? null;

    /*Transaction (Bulk Reject)*/
    return await prisma.$transaction(async (tx) => {

      for (const c of candidates) {

        /*President safety check*/
        if (presidentId && c.form5_member_id === presidentId) {
          throw {
            statusCode: 400,
            message: "President cannot contest for Vice-President",
          };
        }

        /* Validate candidate belongs to society */
        const member = await tx.form5.findFirst({
          where: {
            id: c.form5_member_id,
            form4_filed_soc_id: society.form4_filed_soc_id,
            is_active: true,
          },
        });

        if (!member) {
          throw {
            statusCode: 400,
            message: `Candidate ${c.form5_member_id} invalid`,
          };
        }

        await tx.form10_candidate_status.upsert({
          where: {
            form10_society_id_form5_member_id: {
              form10_society_id,
              form5_member_id: c.form5_member_id,
            },
          },
          update: {
            status: form10_candidate_status_status.REJECTED,
            remarks: c.remarks ?? null,
          },
          create: Form10Service.buildRejectCandidateStatus({
            form10_id,
            form10_society_id,
            form5_member_id: c.form5_member_id,
            remarks: c.remarks ?? null,
          }),
        });
      }

      return Form10Service.buildRejectResponse({
        rejected_count: candidates.length,
      });
    });
  },

  /*WITHDRAW (BULK)*/
async withdraw(params: {
  uid: number;
  form10_id: number;
  form10_society_id: number;
  candidates: {
    form5_member_id: number;
    remarks?: string;
  }[];
}) {

  const { uid, form10_id, form10_society_id, candidates } = params;

  /*Validate Form10 ownership + DRAFT status*/
  const form10 = await prisma.form10.findFirst({
    where: { id: form10_id, uid },
    select: { status: true },
  });

  if (!form10) {
    throw { statusCode: 404, message: "Form10 not found" };
  }

  if (form10.status !== form10_status.DRAFT) {
    throw { statusCode: 400, message: "Form10 not editable" };
  }

  /*Validate Society belongs to Form10*/
  const society = await prisma.form10_society.findFirst({
    where: { id: form10_society_id, form10_id },
    select: { form4_filed_soc_id: true },
  });

  if (!society) {
    throw { statusCode: 404, message: "Form10 society not found" };
  }

  /*Fetch President from Form9 (Exclude Them)*/
  const president = await prisma.form9_society.findFirst({
    where: {
      form4_filed_soc_id: society.form4_filed_soc_id,
      status: "FINALIZED",
    },
    select: {
      president_form5_candidate_id: true,
    },
  });

  const presidentId = president?.president_form5_candidate_id ?? null;

  /*Transaction (Bulk Withdraw)*/
  return await prisma.$transaction(async (tx) => {

    for (const c of candidates) {

      /*President safety check */
      if (presidentId && c.form5_member_id === presidentId) {
        throw {
          statusCode: 400,
          message: "President cannot contest for Vice-President",
        };
      }

      /* Validate candidate belongs to society */
      const member = await tx.form5.findFirst({
        where: {
          id: c.form5_member_id,
          form4_filed_soc_id: society.form4_filed_soc_id,
          is_active: true,
        },
      });

      if (!member) {
        throw {
          statusCode: 400,
          message: `Candidate ${c.form5_member_id} invalid`,
        };
      }

      await tx.form10_candidate_status.upsert({
        where: {
          form10_society_id_form5_member_id: {
            form10_society_id,
            form5_member_id: c.form5_member_id,
          },
        },
        update: {
          status: form10_candidate_status_status.WITHDRAWN,
          remarks: c.remarks ?? null,
        },
        create: Form10Service.buildWithdrawCandidateStatus({
          form10_id,
          form10_society_id,
          form5_member_id: c.form5_member_id,
          remarks: c.remarks ?? null,
        }),
      });
    }

    return null;
  });
},

/*FINAL (PER SOCIETY)*/
async final(params: {
  uid: number;
  form10_id: number;
  form10_society_id: number;
}) {

  const { uid, form10_id, form10_society_id } = params;

  /*Validate Form10 ownership + DRAFT*/
  const form10 = await prisma.form10.findFirst({
    where: { id: form10_id, uid },
    select: { status: true },
  });

  if (!form10) {
    throw { statusCode: 404, message: "Form10 not found" };
  }

  if (form10.status !== form10_status.DRAFT) {
    throw { statusCode: 400, message: "Form10 not editable" };
  }

  /*Validate society belongs to Form10*/
  const society = await prisma.form10_society.findFirst({
    where: { id: form10_society_id, form10_id },
    select: { status: true, form4_filed_soc_id: true },
  });

  if (!society) {
    throw { statusCode: 404, message: "Form10 society not found" };
  }

  if (society.status === form10_society_status.FINALIZED) {
    throw { statusCode: 400, message: "Society already finalized" };
  }

  /*Fetch President from Form9 (Exclude Them)*/
  const president = await prisma.form9_society.findFirst({
    where: {
      form4_filed_soc_id: society.form4_filed_soc_id,
      status: "FINALIZED",
    },
    select: {
      president_form5_candidate_id: true,
    },
  });

  const presidentId = president?.president_form5_candidate_id ?? null;

  /*Get ACTIVE candidates (Exclude President)*/
  const activeCandidates = await prisma.form5.findMany({
    where: {
      form4_filed_soc_id: society.form4_filed_soc_id,
      is_active: true,

      ...(presidentId && {
        id: { not: presidentId },   
      }),

      OR: [
        {
          form10_candidate_status: {
            none: { form10_society_id },
          },
        },
        {
          form10_candidate_status: {
            some: {
              form10_society_id,
              status: {
                notIn: [
                  form10_candidate_status_status.REJECTED,
                  form10_candidate_status_status.WITHDRAWN,
                ],
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  if (activeCandidates.length === 0) {
    throw { statusCode: 400, message: "No active candidates found" };
  }

  /*Decide Election Type*/
  const electionType =
    Form10Service.decideElectionType(activeCandidates.length);

  const vicePresidentId =
    electionType === "UNOPPOSED"
      ? activeCandidates[0].id
      : null;

  /*Update Society*/
  await prisma.form10_society.update({
    where: { id: form10_society_id },
    data: Form10Service.buildFinalSocietyUpdate({
      election_type: electionType,
      vice_president_form5_candidate_id: vicePresidentId,
    }),
  });

  /*Return Response*/
  return Form10Service.buildFinalResponse({
    form10_id,
    form10_society_id,
    election_type: electionType,
  });
},

/*SUBMIT*/
async submit(params: {
  uid: number;
  form10_id: number;
}) {

  const { uid, form10_id } = params;

  /*Validate Form10 ownership + DRAFT*/
  const form10 = await prisma.form10.findFirst({
    where: { id: form10_id, uid },
    select: { status: true },
  });

  if (!form10) {
    throw { statusCode: 404, message: "Form10 not found" };
  }

  if (form10.status !== form10_status.DRAFT) {
    throw { statusCode: 400, message: "Only DRAFT can be submitted" };
  }

  /*Ensure all societies are FINALIZED*/
  const pendingSocieties = await prisma.form10_society.count({
    where: {
      form10_id,
      status: { not: form10_society_status.FINALIZED },
    },
  });

  if (pendingSocieties > 0) {
    throw {
      statusCode: 400,
      message: "All societies must be finalized",
    };
  }

  /*Update Form10 status*/
  await prisma.form10.update({
    where: { id: form10_id },
    data: Form10Service.buildSubmitForm10Update(),
  });

  /*Return response*/
  return Form10Service.buildSubmitResponse();
},
/*LIST (VICE PRESIDENT RESULTS)*/
async list(params: { uid: number; role: number }) {

  const { uid, role } = params;

  let form10;

  /* 🔹 ADMIN → show latest Form10 */
  if (role === 1) {
    form10 = await prisma.form10.findFirst({
      orderBy: { id: "desc" },
      select: { id: true, status: true },
    });
  }

  /* 🔹 NORMAL USER → show their Form10 */
  else {
    form10 = await prisma.form10.findFirst({
      where: { uid },
      orderBy: { id: "desc" },
      select: { id: true, status: true },
    });
  }

  if (!form10) {
    throw { statusCode: 404, message: "No Form10 found" };
  }

  /* Fetch Societies */
  const societies = await prisma.form10_society.findMany({
    where: { form10_id: form10.id },
    include: {
      form4_filed_soc_mem_count: true,
      form5: true,
    },
  });

  /* Build Response */
  return societies.map((soc) =>
    Form10Service.buildListSociety({
      form10_society_id: soc.id,
      form4_filed_soc_id: soc.form4_filed_soc_id,
      society_id: soc.form4_filed_soc_mem_count.society_id,
      society_name: soc.form4_filed_soc_mem_count.society_name ?? "",
      election_type: soc.election_type,
      vice_president_winner: soc.form5
        ? {
            form5_member_id: soc.form5.id,
            member_name: soc.form5.member_name,
            aadhar_no: soc.form5.aadhar_no,
          }
        : null,
      is_draft_visible: form10.status === "DRAFT",
    })
  );
},


};
