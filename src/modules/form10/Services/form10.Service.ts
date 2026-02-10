// import prisma from "../../shared/prisma";
// import {
//   form10_status,
//   form10_society_status,
//   form10_candidate_status_status
// } from "@prisma/client";

// export const Form10Service = {

  
//   async getPreview(uid: number) {
//     const user = await prisma.users.findUnique({
//       where: { id: uid },
//       select: { district_id: true }
//     });
//     if (!user?.district_id) throw new Error("User district not found");

    
//     const form9 = await prisma.form9.findFirst({
//       where: {
//         district_id: user.district_id,
//         status: "SUBMITTED"
//       },
//       orderBy: { id: "desc" }
//     });
//     if (!form9) throw new Error("Form9 not submitted");

//     const presidentMap = new Map<number, number>();

//     const f9Societies = await prisma.form9_society.findMany({
//       where: {
//         form9_id: form9.id,
//         status: "FINALIZED"
//       }
//     });

//     for (const s of f9Societies) {
//       if (s.president_form5_candidate_id) {
//         presidentMap.set(
//           s.form4_filed_soc_id,
//           s.president_form5_candidate_id
//         );
//       }
//     }

//     const societies = await prisma.form4_filed_soc_mem_count.findMany({
//       where: { form4: { district_id: user.district_id } }
//     });

//     const response: any[] = [];

//     for (const soc of societies) {
//       const excludedPresidentId = presidentMap.get(soc.id);

//       const candidates = await prisma.form5.findMany({
//         where: {
//           form4_filed_soc_id: soc.id,
//           is_active: true,
//           id: excludedPresidentId ? { not: excludedPresidentId } : undefined
//         }
//       });

//       response.push({
//         form4_filed_soc_id: soc.id,
//         society_id: soc.society_id, 
//         society_name: soc.society_name,
//         candidates
//       });
//     }

//     return response;
//   },

  
//   async init(uid: number) {
//     return prisma.$transaction(async (tx) => {
//       const user = await tx.users.findUnique({
//         where: { id: uid },
//         select: { district_id: true, department_id: true, zone_id: true }
//       });
//       if (!user?.district_id) throw new Error("User district not found");

//       const societies = await tx.form4_filed_soc_mem_count.findMany({
//         where: { form4: { district_id: user.district_id } }
//       });

//       const form10 = await tx.form10.create({
//         data: {
//           uid,
//           department_id: user.department_id ?? null,
//           district_id: user.district_id,
//           zone_id: user.zone_id ? Number(user.zone_id) : null,
//           status: form10_status.DRAFT
//         }
//       });

//       for (const soc of societies) {
//         await tx.form10_society.create({
//           data: {
//             form10_id: form10.id,
//             form4_filed_soc_id: soc.id,
//             status: form10_society_status.DRAFT
//           }
//         });
//       }

//       return { form10_id: form10.id };
//     });
//   },

  
//   async rejectCandidates(payload: any, uid: number) {
//     return prisma.$transaction(async (tx) => {

//       const society = await tx.form10_society.findUnique({
//         where: { id: payload.form10_society_id },
//         select: { form10_id: true }
//       });
//       if (!society) throw new Error("Form10 society not found");

//       for (const c of payload.candidates) {
//         await tx.form10_candidate_status.upsert({
//           where: {
//             form10_society_id_form5_member_id: {
//               form10_society_id: payload.form10_society_id,
//               form5_member_id: c.form5_member_id
//             }
//           },
//           update: {
//             status: form10_candidate_status_status.REJECTED,
//             remarks: c.remarks ?? null
//           },
//           create: {
//             form10_id: society.form10_id,
//             form10_society_id: payload.form10_society_id,
//             form5_member_id: c.form5_member_id,
//             status: form10_candidate_status_status.REJECTED,
//             remarks: c.remarks ?? null
//           }
//         });
//       }

//       return true;
//     });
//   },

  
//   async withdrawCandidates(payload: any, uid: number) {
//     return prisma.$transaction(async (tx) => {

//       const society = await tx.form10_society.findUnique({
//         where: { id: payload.form10_society_id },
//         select: { form10_id: true }
//       });
//       if (!society) throw new Error("Form10 society not found");

//       for (const c of payload.candidates) {
//         await tx.form10_candidate_status.upsert({
//           where: {
//             form10_society_id_form5_member_id: {
//               form10_society_id: payload.form10_society_id,
//               form5_member_id: c.form5_member_id
//             }
//           },
//           update: {
//             status: form10_candidate_status_status.WITHDRAWN,
//             remarks: c.remarks ?? null
//           },
//           create: {
//             form10_id: society.form10_id,
//             form10_society_id: payload.form10_society_id,
//             form5_member_id: c.form5_member_id,
//             status: form10_candidate_status_status.WITHDRAWN,
//             remarks: c.remarks ?? null
//           }
//         });
//       }

//       return true;
//     });
//   },

  
//   async finalizeSociety(payload: any, uid: number) {
//     return prisma.$transaction(async (tx) => {

//       const society = await tx.form10_society.findUnique({
//         where: { id: payload.form10_society_id }
//       });
//       if (!society) throw new Error("Invalid society");

//       if (!payload.vice_president_form5_candidate_id) {
//         throw new Error("Vice-President must be selected");
//       }

//       await tx.form10_society.update({
//         where: { id: payload.form10_society_id },
//         data: {
//           election_type: payload.election_type,
//           vice_president_form5_candidate_id:
//             payload.vice_president_form5_candidate_id,
//           status: form10_society_status.FINALIZED
//         }
//       });

//       return true;
//     });
//   },

 
//   async submitForm10(form10_id: number, uid: number) {
//     return prisma.$transaction(async (tx) => {

//       const pending = await tx.form10_society.findMany({
//         where: {
//           form10_id,
//           status: { not: form10_society_status.FINALIZED }
//         }
//       });

//       if (pending.length) {
//         throw new Error("All societies must be finalized");
//       }

//       await tx.form10.update({
//         where: { id: form10_id },
//         data: { status: form10_status.SUBMITTED }
//       });

//       return true;
//     });
//   },

  
//   async list(uid: number) {
//     const user = await prisma.users.findUnique({
//       where: { id: uid },
//       select: { district_id: true }
//     });
//     if (!user?.district_id) throw new Error("User district not found");

//     const form10 = await prisma.form10.findFirst({
//       where: {
//         district_id: user.district_id,
//         status: form10_status.SUBMITTED
//       },
//       orderBy: { id: "desc" }
//     });

//     if (!form10) return [];

//     const societies = await prisma.form10_society.findMany({
//       where: {
//         form10_id: form10.id,
//         status: form10_society_status.FINALIZED
//       },
//       include: {
//         form4_filed_soc_mem_count: true,
//         form5: true
//       }
//     });

//     return societies.map(soc => ({
//       form10_society_id: soc.id,
//       form4_filed_soc_id: soc.form4_filed_soc_id,
//       society_id: soc.form4_filed_soc_mem_count.society_id,
//       society_name: soc.form4_filed_soc_mem_count.society_name,
//       election_type: soc.election_type,
//       vice_president_winner: soc.form5
//         ? {
//             form5_member_id: soc.form5.id,
//             member_name: soc.form5.member_name,
//             aadhar_no: soc.form5.aadhar_no,
//             category_type: soc.form5.category_type
//           }
//         : null
//     }));
//   }

// };
