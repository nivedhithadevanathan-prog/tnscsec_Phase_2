// import prisma from "../../shared/prisma";

// function cleanText(text?: string | null) {
//   if (!text) return text;
//   return text.replace(/[\r\n]+/g, " ").trim();
// }

// export const Form7Service = {

//   async getPreview(uid: number) {

    
//     const user = await prisma.users.findUnique({
//       where: { id: uid },
//       select: { district_id: true }
//     });

//     if (!user?.district_id) {
//       throw new Error("District not mapped to user");
//     }

    
//     const district = await prisma.district.findUnique({
//       where: { id: user.district_id },
//       select: { id: true, name: true }
//     });

    
//     const form6 = await prisma.form6.findFirst({
//       where: {
//         uid,
//         status: "SUBMITTED"
//       },
//       select: { id: true }
//     });

//     if (!form6) {
//       throw new Error("Form6 not submitted");
//     }

    
//     const societies = await prisma.form6_society_decision.findMany({
//       where: {
//         form6_id: form6.id,
//         election_status: "QUALIFIED"
//       },
//       select: {
//         form4_filed_soc_id: true,
//         society_id: true,
//         society_name: true,
//         final_sc_st_count: true,
//         final_women_count: true,
//         final_general_count: true
//       }
//     });

//     if (!societies.length) {
//       return {
//         district: {
//           id: district?.id ?? null,
//           name: cleanText(district?.name) ?? null
//         },
//         societies: []
//       };
//     }

    
//     const ruralRows = await prisma.form4_filed_soc_mem_count.findMany({
//       where: {
//         id: { in: societies.map(s => s.form4_filed_soc_id) }
//       },
//       select: {
//         id: true,
//         rural_sc_st: true,
//         rural_women: true,
//         rural_general: true,
//         rural_tot_voters: true
//       }
//     });

//     const ruralMap = new Map(
//       ruralRows.map(r => [r.id, r])
//     );

   
//     const form3SocietyRows = await prisma.form3_societies.findMany({
//       where: {
//         society_id: { in: societies.map(s => s.society_id) },
//         form3: {
//           district_id: user.district_id,
//           is_active: 1
//         }
//       },
//       select: {
//         society_id: true,
//         tot_voters: true
//       }
//     });

//     const form3Map = new Map(
//       form3SocietyRows.map(f => [f.society_id, f.tot_voters ?? 0])
//     );

    
//     return {
//       district: {
//         id: district?.id ?? null,
//         name: cleanText(district?.name) ?? null
//       },

//       societies: societies.map(s => {
//         const rural = ruralMap.get(s.form4_filed_soc_id);

//         const ruralSc = rural?.rural_sc_st ?? 0;
//         const ruralW = rural?.rural_women ?? 0;
//         const ruralG = rural?.rural_general ?? 0;

//         const decSc = s.final_sc_st_count ?? 0;
//         const decW = s.final_women_count ?? 0;
//         const decG = s.final_general_count ?? 0;

//         return {
//           society_id: s.society_id,
//           society_name: cleanText(s.society_name),

          
//           form3_total: form3Map.get(s.society_id) ?? 0,

//           rural: {
//             sc_st: ruralSc,
//             women: ruralW,
//             general: ruralG,
//             total_voters: rural?.rural_tot_voters ?? 0
//           },

//           declared: {
//             sc_st: decSc,
//             women: decW,
//             general: decG
//           },

//           qualified_categories: {
//   sc_st: {
//     eligible: decSc > ruralSc,
//     count: decSc > ruralSc ? decSc : 0
//   },
//   women: {
//     eligible: decW > ruralW,
//     count: decW > ruralW ? decW : 0
//   },
//   general: {
//     eligible: decG > ruralG,
//     count: decG > ruralG ? decG : 0
//   }
// }
  
//         };
//       })
//     };
//   },


  
//  async submitForm7(payload: any, uid: number) {

  
//   const user = await prisma.users.findUnique({
//     where: { id: uid },
//     select: { district_id: true }
//   });

//   if (!user?.district_id) {
//     throw new Error("District not mapped to user");
//   }

  
//   const form6 = await prisma.form6.findFirst({
//     where: {
//       uid,
//       status: "SUBMITTED"
//     }
//   });

//   if (!form6) {
//     throw new Error("Form6 not submitted");
//   }

  
//   if (!Array.isArray(payload.societies) || payload.societies.length === 0) {
//     throw new Error("At least one society is required");
//   }

  
//   const form7 = await prisma.form7.create({
//     data: {
//       district_id: user.district_id
//     }
//   });

  
//   const societyRows = payload.societies.map((s: any) => {

//     return {
//       form7_id: form7.id,

//       society_id: s.society_id,
//       society_name: s.society_name,

//       final_sc_st_count: s.final_sc_st_count ?? 0,
//       final_women_count: s.final_women_count ?? 0,
//       final_general_count: s.final_general_count ?? 0,

//       form3_total: s.form3_total ?? 0,
//       casted_votes_count: s.casted_votes_count ?? 0,
//       voting_percentage: s.voting_percentage ?? 0,

//       ballot_box_count: s.ballot_box_count ?? 0,
//       stamp_count: s.stamp_count ?? 0,
//       polling_stations_count: s.polling_stations_count ?? 0,
//       election_officers_count: s.election_officers_count ?? 0,

//       polling_suspension_count: s.polling_suspension_count
//     };
//   });

  
//   await prisma.form7_societies.createMany({
//     data: societyRows
//   });

  
//   return {
//     form7_id: form7.id,
//     district_id: user.district_id,
//     societies_count: societyRows.length,
//     status: "FORM7_SUBMITTED"
//   };
// },



// async listForm7(uid: number) {

    
//     const user = await prisma.users.findUnique({
//       where: { id: uid },
//       select: { district_id: true }
//     });

//     if (!user?.district_id) {
//       throw new Error("District not mapped to user");
//     }

    
//     const district = await prisma.district.findUnique({
//       where: { id: user.district_id },
//       select: { id: true, name: true }
//     });

    
//     const form7 = await prisma.form7.findFirst({
//       where: { district_id: user.district_id },
//       orderBy: { id: "desc" }
//     });

    
//     let submittedMap = new Map<number, any>();

//     if (form7) {
//       const submittedSocieties = await prisma.form7_societies.findMany({
//         where: { form7_id: form7.id }
//       });

//       submittedMap = new Map(
//         submittedSocieties.map(s => [s.society_id, s])
//       );
//     }

    
//     const form6 = await prisma.form6.findFirst({
//       where: { uid, status: "SUBMITTED" },
//       select: { id: true }
//     });

//     if (!form6) {
//       return {
//         district: {
//           id: district?.id ?? null,
//           name: cleanText(district?.name) ?? null
//         },
//         submitted: false,
//         societies: []
//       };
//     }

    
//     const societies = await prisma.form6_society_decision.findMany({
//       where: {
//         form6_id: form6.id,
//         election_status: "QUALIFIED"
//       },
//       select: {
//         form4_filed_soc_id: true,
//         society_id: true,
//         society_name: true,
//         final_sc_st_count: true,
//         final_women_count: true,
//         final_general_count: true
//       }
//     });

    
//     const ruralRows = await prisma.form4_filed_soc_mem_count.findMany({
//       where: {
//         id: { in: societies.map(s => s.form4_filed_soc_id) }
//       }
//     });

//     const ruralMap = new Map(
//       ruralRows.map(r => [r.id, r])
//     );

    
//     const form3Rows = await prisma.form3_societies.findMany({
//       where: {
//         society_id: { in: societies.map(s => s.society_id) },
//         form3: {
//           district_id: user.district_id,
//           is_active: 1
//         }
//       },
//       select: {
//         society_id: true,
//         tot_voters: true
//       }
//     });

//     const form3Map = new Map(
//       form3Rows.map(f => [f.society_id, f.tot_voters ?? 0])
//     );

    
//     return {
//       district: {
//         id: district?.id ?? null,
//         name: cleanText(district?.name) ?? null
//       },
//       submitted: Boolean(form7),

//       societies: societies.map(s => {
//         const rural = ruralMap.get(s.form4_filed_soc_id);
//         const submitted = submittedMap.get(s.society_id);

//         const ruralSc = rural?.rural_sc_st ?? 0;
//         const ruralW = rural?.rural_women ?? 0;
//         const ruralG = rural?.rural_general ?? 0;

//         const decSc = s.final_sc_st_count ?? 0;
//         const decW = s.final_women_count ?? 0;
//         const decG = s.final_general_count ?? 0;

//         return {
//           society_id: s.society_id,
//           society_name: cleanText(s.society_name),

//           form3_total: form3Map.get(s.society_id) ?? 0,

//           rural: {
//             sc_st: ruralSc,
//             women: ruralW,
//             general: ruralG,
//             total_voters: rural?.rural_tot_voters ?? 0
//           },

//           declared: {
//             sc_st: decSc,
//             women: decW,
//             general: decG
//           },

//           qualified_categories: {
//             sc_st: {
//               eligible: decSc > ruralSc,
//               count: decSc > ruralSc ? decSc : 0
//             },
//             women: {
//               eligible: decW > ruralW,
//               count: decW > ruralW ? decW : 0
//             },
//             general: {
//               eligible: decG > ruralG,
//               count: decG > ruralG ? decG : 0
//             }
//           },

//           submitted_data: submitted
//             ? {
//                 casted_votes_count: submitted.casted_votes_count,
//                 voting_percentage: submitted.voting_percentage,
//                 ballot_box_count: submitted.ballot_box_count,
//                 stamp_count: submitted.stamp_count,
//                 polling_stations_count: submitted.polling_stations_count,
//                 election_officers_count: submitted.election_officers_count,
//                 polling_suspension_count: submitted.polling_suspension_count
//               }
//             : null
//         };
//       })
//     };
//   }



// };
