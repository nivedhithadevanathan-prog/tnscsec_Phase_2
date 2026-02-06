// import prisma from "../../shared/prisma";
// import {
//   form9_status,
//   form9_society_status,
//   form9_candidate_status_status
// } from "@prisma/client";

// export const Form9Service = {

 
 

// async getPreview(uid: number) {
//   const user = await prisma.users.findUnique({
//     where: { id: uid },
//     select: { district_id: true }
//   });
//   if (!user?.district_id) throw new Error("User district not found");

  
//   const form6 = await prisma.form6.findFirst({
//     where: {
//       district_id: user.district_id,
//       status: "SUBMITTED"
//     },
//     orderBy: { id: "desc" }
//   });
//   if (!form6) throw new Error("Form6 not found");

//   const form6Societies = await prisma.form6_society_decision.findMany({
//     where: { form6_id: form6.id }
//   });

  
//   const latestForm9 = await prisma.form9.findFirst({
//     where: { district_id: user.district_id },
//     orderBy: { id: "desc" }
//   });
//   if (!latestForm9) return [];

  
//   const form9Societies = await prisma.form9_society.findMany({
//     where: { form9_id: latestForm9.id }
//   });

//   const form9SocietyMap = new Map<number, typeof form9Societies[0]>();
//   for (const s of form9Societies) {
//     form9SocietyMap.set(s.form4_filed_soc_id, s);
//   }

//   const response: any[] = [];

  
//   for (const soc of form6Societies) {
//     const form9Soc = form9SocietyMap.get(soc.form4_filed_soc_id);

    
//     if (
//       form9Soc?.status === "FINALIZED" &&
//       form9Soc.election_type === "UNOPPOSED"
//     ) {
//       continue;
//     }

//     const filedSoc = await prisma.form4_filed_soc_mem_count.findUnique({
//       where: { id: soc.form4_filed_soc_id }
//     });
//     if (!filedSoc) continue;

    
//     const candidateStatuses = form9Soc
//       ? await prisma.form9_candidate_status.findMany({
//           where: { form9_society_id: form9Soc.id },
//           select: {
//             form5_member_id: true,
//             status: true
//           }
//         })
//       : [];

//     const statusMap = new Map<number, string | null>();
//     for (const s of candidateStatuses) {
//       statusMap.set(s.form5_member_id, s.status ?? null);
//     }

    
//     const candidates = await prisma.form5.findMany({
//       where: {
//         form4_filed_soc_id: filedSoc.id,
//         is_active: true
//       }
//     });

//     const visibleCandidates = candidates.filter(c => {
//       const status = statusMap.get(c.id);
//       return (
//         !status ||
//         status === "ELIGIBLE" ||
//         status === "CONTESTING" ||
//         status === "ELECTED" ||
//         status === "LOST"
//       );
//     });

//     const isFinalized = form9Soc?.status === "FINALIZED";
//     const isFinalizedPoll =
//       isFinalized && form9Soc?.election_type === "POLL";

//     response.push({
//       form4_filed_soc_id: filedSoc.id,
//       society_id: filedSoc.society_id,
//       society_name: filedSoc.society_name,

//       election_status: soc.election_status,
//       election_action: soc.election_action,

//       election_type: form9Soc?.election_type ?? null,
//       is_finalized: isFinalized,

      
//       editable: !isFinalizedPoll,
//       can_unopposed: !isFinalized,

//       president_form5_candidate_id:
//         form9Soc?.president_form5_candidate_id ?? null,

//       final_counts: {
//         sc_st: soc.final_sc_st_count ?? 0,
//         women: soc.final_women_count ?? 0,
//         general: soc.final_general_count ?? 0,
//         total: soc.final_total_count ?? 0
//       },

//       candidates: visibleCandidates.map(c => ({
//         form5_member_id: c.id,
//         member_name: c.member_name,
//         aadhar_no: c.aadhar_no,
//         category_type: c.category_type,
//         is_elected: statusMap.get(c.id) === "ELECTED"
//       }))
//     });
//   }

//   return response;
// },


  
//   async init(uid: number) {
//     return prisma.$transaction(async (tx) => {
//       const user = await tx.users.findUnique({
//         where: { id: uid },
//         select: { district_id: true, department_id: true, zone_id: true }
//       });
//       if (!user?.district_id) throw new Error("User district not found");

//       const previewSocieties = await tx.form4_filed_soc_mem_count.findMany({
//         where: { form4: { district_id: user.district_id } },
//         select: { id: true }
//       });
//       if (!previewSocieties.length)
//         throw new Error("No societies available for Form9");

//       const form9 = await tx.form9.create({
//         data: {
//           uid,
//           department_id: user.department_id ?? null,
//           district_id: user.district_id,
//           zone_id: user.zone_id ? Number(user.zone_id) : null,
//           status: form9_status.DRAFT
//         }
//       });

//       for (const soc of previewSocieties) {
//         await tx.form9_society.create({
//           data: {
//             form9_id: form9.id,
//             form4_filed_soc_id: soc.id,
//             status: form9_society_status.DRAFT
//           }
//         });
//       }

//       return { form9_id: form9.id };
//     });
//   },

  
//   async rejectCandidates(payload: any, uid: number) {
//     return prisma.$transaction(async (tx) => {

//       const society = await tx.form9_society.findUnique({
//         where: { id: payload.form9_society_id },
//         select: { form9_id: true }
//       });
//       if (!society) throw new Error("Form9 society not found");

//       for (const c of payload.candidates) {
//         await tx.form9_candidate_status.upsert({
//           where: {
//             form9_society_id_form5_member_id: {
//               form9_society_id: payload.form9_society_id,
//               form5_member_id: c.form5_member_id
//             }
//           },
//           update: {
//             status: form9_candidate_status_status.REJECTED,
//             remarks: c.remarks ?? null
//           },
//           create: {
//             form9_id: society.form9_id,          
//             form9_society_id: payload.form9_society_id,
//             form5_member_id: c.form5_member_id,
//             status: form9_candidate_status_status.REJECTED,
//             remarks: c.remarks ?? null
//           }
//         });
//       }

//       return true;
//     });
//   },

  
//   async withdrawCandidates(payload: any, uid: number) {
//     return prisma.$transaction(async (tx) => {

//       const society = await tx.form9_society.findUnique({
//         where: { id: payload.form9_society_id },
//         select: { form9_id: true }
//       });
//       if (!society) throw new Error("Form9 society not found");

//       for (const c of payload.candidates) {
//         await tx.form9_candidate_status.upsert({
//           where: {
//             form9_society_id_form5_member_id: {
//               form9_society_id: payload.form9_society_id,
//               form5_member_id: c.form5_member_id
//             }
//           },
//           update: {
//             status: form9_candidate_status_status.WITHDRAWN,
//             remarks: c.remarks ?? null
//           },
//           create: {
//             form9_id: society.form9_id,          
//             form9_society_id: payload.form9_society_id,
//             form5_member_id: c.form5_member_id,
//             status: form9_candidate_status_status.WITHDRAWN,
//             remarks: c.remarks ?? null
//           }
//         });
//       }

//       return true;
//     });
//   },

  
//  async finalizeSociety(payload: any, uid: number) {
//   return prisma.$transaction(async (tx) => {

//     const society = await tx.form9_society.findUnique({
//       where: { id: payload.form9_society_id }
//     });
//     if (!society) throw new Error("Invalid society");

    
//     if (!payload.president_form5_candidate_id) {
//       throw new Error("President (winner) must be selected");
//     }

    
//     await tx.form9_society.update({
//       where: { id: payload.form9_society_id },
//       data: {
//         election_type: payload.election_type,
//         president_form5_candidate_id: payload.president_form5_candidate_id,
//         status: "FINALIZED"
//       }
//     });

    
//     const candidates = await tx.form5.findMany({
//       where: {
//         form4_filed_soc_id: society.form4_filed_soc_id,
//         is_active: true
//       },
//       select: { id: true }
//     });

//     for (const c of candidates) {
//       const status =
//         c.id === payload.president_form5_candidate_id
//           ? "ELECTED"
//           : "NOT_SELECTED";

//       await tx.form9_candidate_status.upsert({
//         where: {
//           form9_society_id_form5_member_id: {
//             form9_society_id: payload.form9_society_id,
//             form5_member_id: c.id
//           }
//         },
//         update: { status },
//         create: {
//           form9_id: society.form9_id,
//           form9_society_id: payload.form9_society_id,
//           form5_member_id: c.id,
//           status
//         }
//       });
//     }

//     return true;
//   });
// },


 
// async submitForm9(form9_id: number, uid: number) {
//   console.log("Submitting Form9:", form9_id, "by user:", uid);
//   return prisma.$transaction(async (tx) => {

    
//     const pending = await tx.form9_society.findMany({
//       where: {
//         form9_id,
//         status: { not: "FINALIZED" }
//       }
//     });

//     if (pending.length) {
//       throw new Error("All societies must be finalized");
//     }

    
//     const invalid = await tx.form9_society.findMany({
//       where: {
//         form9_id,
//         election_type: "UNOPPOSED",
//         president_form5_candidate_id: null
//       }
//     });

//     if (invalid.length) {
//       throw new Error(
//         "President must be selected for all UNOPPOSED societies"
//       );
//     }

    
//     const societies = await tx.form9_society.findMany({
//       where: { form9_id },
//       select: {
//         id: true,
//         form4_filed_soc_id: true,
//         president_form5_candidate_id: true,
//         election_type: true
//       }
//     });

//     for (const soc of societies) {
//       const candidates = await tx.form5.findMany({
//         where: {
//           form4_filed_soc_id: soc.form4_filed_soc_id,
//           is_active: true
//         },
//         select: { id: true }
//       });

//       for (const c of candidates) {
//         let status: form9_candidate_status_status;

//         if (soc.election_type === "UNOPPOSED") {
//           status =
//             c.id === soc.president_form5_candidate_id
//               ? form9_candidate_status_status.ELECTED
//               : form9_candidate_status_status.LOST;
//         } else {
          
//           status = form9_candidate_status_status.CONTESTING;
//         }

//         await tx.form9_candidate_status.upsert({
//           where: {
//             form9_society_id_form5_member_id: {
//               form9_society_id: soc.id,
//               form5_member_id: c.id
//             }
//           },
//           update: { status },
//           create: {
//             form9_id,
//             form9_society_id: soc.id,
//             form5_member_id: c.id,
//             status
//           }
//         });
//       }
//     }

    
//     await tx.form9.update({
//       where: { id: form9_id },
//       data: {
//         status: form9_status.SUBMITTED
//       }
//     });

//     return true;
//   });
// },

// async list(uid: number) {
//   const user = await prisma.users.findUnique({
//     where: { id: uid },
//     select: { district_id: true }
//   });
//   if (!user?.district_id) throw new Error("User district not found");

  
//   const form9 = await prisma.form9.findFirst({
//     where: {
//       district_id: user.district_id,
//       status: form9_status.SUBMITTED
//     },
//     orderBy: { id: "desc" }
//   });

//   if (!form9) return [];

//   const societies = await prisma.form9_society.findMany({
//     where: {
//       form9_id: form9.id,
//       status: form9_society_status.FINALIZED
//     },
//     include: {
//       form4_filed_soc_mem_count: {
//         select: {
//           id: true,
//           society_id: true,
//           society_name: true
//         }
//       },
//       form5: {
//         select: {
//           id: true,
//           member_name: true,
//           aadhar_no: true,
//           category_type: true
//         }
//       }
//     }
//   });

//   return societies.map(soc => ({
//     form9_society_id: soc.id,
//     form4_filed_soc_id: soc.form4_filed_soc_id,

//     society_id: soc.form4_filed_soc_mem_count.society_id,
//     society_name: soc.form4_filed_soc_mem_count.society_name,

//     election_type: soc.election_type,

//     president_winner: soc.form5
//       ? {
//           form5_member_id: soc.form5.id,
//           member_name: soc.form5.member_name,
//           aadhar_no: soc.form5.aadhar_no,
//           category_type: soc.form5.category_type
//         }
//       : null
//   }));
// }





// };
