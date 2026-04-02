import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()
import { Form9Service } from "../../form9/Services/form9.Service";
import {
  form9_status,
  form9_society_status,
  form9_candidate_status_status,
} from "@prisma/client";

export const Form9Usecase = {

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

      //Fetch members
      const members = await prisma.form5.findMany({
        where: {
          form4_filed_soc_id: soc.id,
          is_active: true,
        },
        select: {
          id: true,
          member_name: true,
          aadhar_no: true,
        },
      });

      //Fetch candidate statuses
      const statuses = await prisma.form9_candidate_status.findMany({
        where: {
          form9_society: {
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

      // 5. Build preview
      const preview = Form9Service.buildPreview({
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

  /*INIT*/
 async init(uid: number | string) {
const userId = Number(uid);
if (!userId) {
  throw { statusCode: 400, message: "Invalid user id" };
}

  if (!userId) {
    throw { statusCode: 400, message: "Invalid user id" };
  }

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

    // Existing draft
   const existing = await prisma.form9.findFirst({
  where: {
    uid: userId,
    status: form9_status.DRAFT,
  },
});


    if (existing) {
      return Form9Service.buildInitResponse({
        form9_id: existing.id,
        societies_count: 0,
      });
    }

    const societies = await prisma.form4_filed_soc_mem_count.findMany({
      select: { id: true },
    });

    if (!societies.length) {
      throw { statusCode: 400, message: "No societies found" };
    }

    return await prisma.$transaction(async (tx) => {

      const form9 = await tx.form9.create({
        data: Form9Service.buildForm9({
          uid: userId,
          district_id: user.district_id,
          zone_id: user.zone_id ? Number(user.zone_id) : null,
          department_id: user.department_id,
        }),
      });

      let count = 0;

      for (const soc of societies) {
        await tx.form9_society.create({
          data: {
            ...Form9Service.buildInitialForm9Society(),
            form9: { connect: { id: form9.id } },
            form4_filed_soc_mem_count: { connect: { id: soc.id } },
          },
        });
        count++;
      }

      return Form9Service.buildInitResponse({
        form9_id: form9.id,
        societies_count: count,
      });
    });
  },

  /*REJECT (BULK)*/
  async reject(params: {
  uid: number;
  form9_id: number;
  form9_society_id: number;
  candidates?: {
    form5_member_id: number;
    remarks?: string;
  }[];
}) {
  const { uid, form9_id, form9_society_id, candidates } = params;

  const form9 = await prisma.form9.findFirst({
    where: { id: form9_id, uid },
    select: { status: true },
  });

  if (!form9) {
    throw { statusCode: 404, message: "Form9 not found" };
  }

  if (form9.status !== form9_status.DRAFT) {
    throw { statusCode: 400, message: "Form9 not editable" };
  }

  const society = await prisma.form9_society.findFirst({
    where: { id: form9_society_id, form9_id },
    select: { id: true, form4_filed_soc_id: true },
  });

  if (!society) {
    throw { statusCode: 404, message: "Form9 society not found" };
  }

  return await prisma.$transaction(async (tx) => {
    //CASE 1: Reject specific candidates
    if (candidates && candidates.length > 0) {
      for (const c of candidates) {
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

        await tx.form9_candidate_status.upsert({
          where: {
            form9_society_id_form5_member_id: {
              form9_society_id,
              form5_member_id: c.form5_member_id,
            },
          },
          update: {
            status: form9_candidate_status_status.REJECTED,
            remarks: c.remarks ?? null,
          },
          create: {
            form9_id,
            form9_society_id,
            form5_member_id: c.form5_member_id,
            status: form9_candidate_status_status.REJECTED,
            remarks: c.remarks ?? null,
          },
        });
      }

      return { rejected_count: candidates.length };
    }

    //CASE 2: Reject ALL pending candidates in society
    const pendingCandidates = await tx.form9_candidate_status.findMany({
      where: {
        form9_society_id,
        status: null,
      },
      select: { form5_member_id: true },
    });

    if (!pendingCandidates.length) {
      throw {
        statusCode: 400,
        message: "No pending candidates to reject",
      };
    }

    await tx.form9_candidate_status.updateMany({
      where: {
        form9_society_id,
        status: null,
      },
      data: {
        status: form9_candidate_status_status.REJECTED,
        remarks: "Rejected by authority",
      },
    });

    return { rejected_count: pendingCandidates.length };
  });
},


  /*WITHDRAW (BULK)*/
  async withdraw(params: {
    uid: number;
    form9_id: number;
    form9_society_id: number;
    candidates: {
      form5_member_id: number;
      remarks?: string;
    }[];
  }) {

    const { uid, form9_id, form9_society_id, candidates } = params;

    const form9 = await prisma.form9.findFirst({
      where: { id: form9_id, uid },
      select: { status: true },
    });

    if (!form9) throw { statusCode: 404, message: "Form9 not found" };
    if (form9.status !== form9_status.DRAFT)
      throw { statusCode: 400, message: "Form9 not editable" };

    const society = await prisma.form9_society.findFirst({
      where: { id: form9_society_id, form9_id },
      select: { form4_filed_soc_id: true },
    });

    if (!society)
      throw { statusCode: 404, message: "Form9 society not found" };

    for (const c of candidates) {

      await prisma.form9_candidate_status.upsert({
        where: {
          form9_society_id_form5_member_id: {
            form9_society_id,
            form5_member_id: c.form5_member_id,
          },
        },
        update: {
          status: form9_candidate_status_status.WITHDRAWN,
          remarks: c.remarks ?? null,
        },
        create: {
          form9_id,
          form9_society_id,
          form5_member_id: c.form5_member_id,
          status: form9_candidate_status_status.WITHDRAWN,
          remarks: c.remarks ?? null,
        },
      });
    }

    return null;
  },

  
 /*FINAL*/
async final(params: {
  uid: number;
  form9_id: number;
  form9_society_id: number;
}) {
  const { uid, form9_id, form9_society_id } = params;

  const form9 = await prisma.form9.findFirst({
    where: { id: form9_id, uid },
    select: { status: true },
  });

  if (!form9) throw { statusCode: 404, message: "Form9 not found" };
  if (form9.status !== form9_status.DRAFT)
    throw { statusCode: 400, message: "Form9 not editable" };

  const society = await prisma.form9_society.findFirst({
    where: { id: form9_society_id, form9_id },
    select: { status: true, form4_filed_soc_id: true },
  });

  if (!society)
    throw { statusCode: 404, message: "Form9 society not found" };
  if (society.status === form9_society_status.FINALIZED)
    throw { statusCode: 400, message: "Society already finalized" };

  /*CORRECT ACTIVE CANDIDATE LOGIC */
  const activeCandidates = await prisma.form5.findMany({
    where: {
      form4_filed_soc_id: society.form4_filed_soc_id,
      is_active: true,
      OR: [
        {
          form9_candidate_status: {
            none: { form9_society_id },
          },
        },
        {
          form9_candidate_status: {
            some: {
              form9_society_id,
              status: {
                notIn: [
                  form9_candidate_status_status.REJECTED,
                  form9_candidate_status_status.WITHDRAWN,
                ],
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (activeCandidates.length === 0) {
    throw { statusCode: 400, message: "No active candidates found" };
  }

  const electionType =
    Form9Service.decideElectionType(activeCandidates.length);

  const presidentId =
    electionType === "UNOPPOSED"
      ? activeCandidates[0].id
      : null;

  await prisma.form9_society.update({
    where: { id: form9_society_id },
    data: Form9Service.buildFinalSocietyUpdate({
      election_type: electionType,
      president_form5_candidate_id: presidentId,
    }),
  });

  return Form9Service.buildFinalResponse({
    form9_id,
    form9_society_id,
    election_type: electionType,
  });
},


  /*SUBMIT*/
  async submit(params: {
    uid: number;
    form9_id: number;
  }) {

    const { uid, form9_id } = params;

    const form9 = await prisma.form9.findFirst({
      where: { id: form9_id, uid },
      select: { status: true },
    });

    if (!form9) throw { statusCode: 404, message: "Form9 not found" };
    if (form9.status !== form9_status.DRAFT)
      throw { statusCode: 400, message: "Only DRAFT can be submitted" };

    const pending = await prisma.form9_society.count({
      where: {
        form9_id,
        status: { not: form9_society_status.FINALIZED },
      },
    });

    if (pending > 0) {
      throw {
        statusCode: 400,
        message: "All societies must be finalized",
      };
    }

    await prisma.form9.update({
      where: { id: form9_id },
      data: Form9Service.buildSubmitForm9Update(),
    });

    return Form9Service.buildSubmitResponse();
  },
/*LIST (WINNERS)*/
async list(params: {
  uid: number;
  role: number;
  department_id?: number;
  district_id?: number;
  zone_id?: string;
}) {

  const { uid, role, department_id, district_id, zone_id } = params;

  let form9;

  // ADMIN - show latest Form9
  if (role === 1) {
    form9 = await prisma.form9.findFirst({
      orderBy: { id: "desc" },
      select: { id: true, status: true },
    });
  }

  // JRCS - filter by department, district, zone
  else if (role === 4) {

    const zoneIds = zone_id
      ? zone_id.split(",").map((z) => Number(z))
      : [];

    form9 = await prisma.form9.findFirst({
      where: {
        department_id,
        district_id,
        ...(zoneIds.length > 0 && {
          zone_id: { in: zoneIds }
        })
      },
      orderBy: { id: "desc" },
      select: { id: true, status: true },
    });
  }

  // NORMAL USER 
  else {
    form9 = await prisma.form9.findFirst({
      where: { uid },
      orderBy: { id: "desc" },
      select: { id: true, status: true },
    });
  }

  if (!form9) {
    throw { statusCode: 404, message: "No Form9 found" };
  }

  const societies = await prisma.form9_society.findMany({
    where: { form9_id: form9.id },
    include: {
      form4_filed_soc_mem_count: true,
      form5: true,
    },
  });

  return societies.map((soc) =>
    Form9Service.buildListSociety({
      form9_society_id: soc.id,
      form4_filed_soc_id: soc.form4_filed_soc_id,
      society_id: soc.form4_filed_soc_mem_count.society_id,
      society_name: soc.form4_filed_soc_mem_count.society_name ?? "",
      election_type: soc.election_type!,
      president_winner: soc.form5
        ? {
            form5_member_id: soc.form5.id,
            member_name: soc.form5.member_name,
            aadhar_no: soc.form5.aadhar_no,
          }
        : null,
      is_draft_visible: form9.status === form9_status.DRAFT,
    })
  );
}
};
