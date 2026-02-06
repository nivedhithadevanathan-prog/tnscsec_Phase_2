// import prisma from "../../shared/prisma";

// function cleanText(text?: string | null) {
//   if (!text) return text;
//   return text.replace(/[\r\n]+/g, " ").trim();
// }



// function getElectionStatus(
//   rural: { sc_st: number; women: number; general: number },
//   final: { sc_st: number; women: number; general: number }
// ): "QUALIFIED" | "UNQUALIFIED" | "UNOPPOSED" {

//   const allEqual =
//     rural.sc_st === final.sc_st &&
//     rural.women === final.women &&
//     rural.general === final.general;

//   const anyGreater =
//     final.sc_st > rural.sc_st ||
//     final.women > rural.women ||
//     final.general > rural.general;

//   if (allEqual) return "UNOPPOSED";
//   if (anyGreater) return "QUALIFIED";
//   return "UNQUALIFIED";
// }

// export const Form6Service = {

// async getBasePreview(uid: number) {

  
//   const form4 = await prisma.form4.findFirst({
//     where: { uid },
//     orderBy: { id: "desc" },
//   });

//   if (!form4) {
//     return {
//       department: null,
//       district: null,
//       zone: null,
//       societies: [],
//     };
//   }

  
//   const societies = await prisma.form4_filed_soc_mem_count.findMany({
//     where: { form4_id: form4.id },
//   });

//   if (!societies.length) {
//     return {
//       department: null,
//       district: null,
//       zone: null,
//       societies: [],
//     };
//   }

  
//   const members = await prisma.form5.findMany({
//     where: {
//       is_active: true,
//       form4_filed_soc_id: {
//         in: societies.map(s => s.id),
//       },
//     },
//   });

  
//   const [department, district, zone] = await Promise.all([
//     form4.department_id
//       ? prisma.department.findUnique({
//           where: { id: form4.department_id },
//           select: { id: true, name: true },
//         })
//       : null,

//     form4.district_id
//       ? prisma.district.findUnique({
//           where: { id: form4.district_id },
//           select: { id: true, name: true },
//         })
//       : null,

//     form4.zone_id
//       ? prisma.zone.findUnique({
//           where: { id: form4.zone_id },
//           select: { id: true, name: true },
//         })
//       : null,
//   ]);

  
//   const societyData = societies.map(soc => ({
//     form4_filed_soc_id: soc.id,
//     society_id: soc.society_id,
//     society_name: cleanText(soc.society_name),
//     election_status: soc.election_status,
//     rural: {
//       sc_st: soc.rural_sc_st ?? 0,
//       women: soc.rural_women ?? 0,
//       general: soc.rural_general ?? 0,
//     },
//     declared: {
//       sc_st: soc.declared_sc_st ?? 0,
//       women: soc.declared_women ?? 0,
//       general: soc.declared_general ?? 0,
//     },
//     members: members
//       .filter(m => m.form4_filed_soc_id === soc.id)
//       .map(m => ({
//         id: m.id,
//         category_type: m.category_type,
//         member_name: m.member_name,
//         aadhar_no: m.aadhar_no,
//       })),
//   }));

//   return {
//     department: department
//       ? { id: department.id, name: cleanText(department.name) }
//       : null,
//     district: district
//       ? { id: district.id, name: cleanText(district.name) }
//       : null,
//     zone: zone
//       ? { id: zone.id, name: cleanText(zone.name) }
//       : null,
//     societies: societyData,
//   };
// },


// async simulatePreview(payload: any, uid: number) {

//   const { form4_filed_soc_id, withdraw_member_ids } = payload;

  
//   const society = await prisma.form4_filed_soc_mem_count.findFirst({
//     where: {
//       id: Number(form4_filed_soc_id),
//       form4: { uid },
//     },
//   });

//   if (!society) {
//     throw new Error("Invalid society");
//   }

  
//   const members = await prisma.form5.findMany({
//     where: {
//       is_active: true,
//       form4_filed_soc_id: society.id,
//     },
//   });

  
//   let sc_st = 0,
//     women = 0,
//     general = 0;

//   const memberPreview = members.map(m => {
//     const withdrawn = withdraw_member_ids.includes(m.id);

//     if (!withdrawn) {
//       if (m.category_type === "sc_st") sc_st++;
//       if (m.category_type === "women") women++;
//       if (m.category_type === "general") general++;
//     }

//     return {
//       id: m.id,
//       category_type: m.category_type,
//       member_name: m.member_name,
//       aadhar_no: m.aadhar_no,
//       withdrawn,
//     };
//   });

//   const total = sc_st + women + general;

  
//   const election_status = getElectionStatus(
//     {
//       sc_st: society.rural_sc_st ?? 0,
//       women: society.rural_women ?? 0,
//       general: society.rural_general ?? 0,
//     },
//     { sc_st, women, general }
//   );

  
//   return {
//     society_id: society.society_id,
//     society_name: society.society_name,
//     remaining_counts: {
//       sc_st,
//       women,
//       general,
//       total,
//     },
//     election_status,
//     members: memberPreview,
//   };
// },


// async stopElection(payload: any, uid: number) {

//   const { form6_id, form4_filed_soc_id, action } = payload; 

  
//   const form6 = await prisma.form6.findFirst({
//     where: { id: form6_id, uid },
//   });
//   if (!form6) throw new Error("Invalid Form6");

  
//   const updated = await prisma.form6_society_decision.updateMany({
//     where: {
//       form6_id,
//       form4_filed_soc_id,
//     },
//     data: {
//       election_action: action,
//       election_status: action === "STOP" ? "UNQUALIFIED" : undefined,
//       updated_at: new Date(),
//     },
//   });

//   if (!updated.count) {
//     throw new Error("Society not found in Form6");
//   }

//   return { action };
// },


// async submitForm6(form6_id: number, uid: number) {

//   const form6 = await prisma.form6.findFirst({
//     where: { id: form6_id, uid },
//   });
//   if (!form6) throw new Error("Invalid Form6");

//   if (form6.status === "SUBMITTED") {
//     throw new Error("Form6 already submitted");
//   }

  
//   await prisma.form6.update({
//     where: { id: form6_id },
//     data: {
//       status: "SUBMITTED",
//       submitted_at: new Date(),
//     },
//   });

//   return { submitted: true };
// },

// async initForm6(uid: number) {
    
//     const submittedForm = await prisma.form6.findFirst({
//       where: {
//         uid,
//         status: "SUBMITTED",
//       },
//       select: { id: true },
//     });

//     if (submittedForm) {
//       throw new Error(
//         "Form6 already submitted. Multiple submissions are not allowed."
//       );
//     }

    
//     const existingDraft = await prisma.form6.findFirst({
//       where: {
//         uid,
//         status: "DRAFT",
//       },
//     });

//     if (existingDraft) {
//       return {
//         form6_id: existingDraft.id,
//         status: existingDraft.status,
//         created_at: existingDraft.created_at,
//       };
//     }

   
//     const user = await prisma.users.findUnique({
//       where: { id: uid },
//       select: {
//         department_id: true,
//         district_id: true,
//         zone_id: true,
//       },
//     });

//     if (!user) throw new Error("User not found");

    
//     const form6 = await prisma.form6.create({
//       data: {
//         uid,
//         department_id: user.department_id
//           ? Number(user.department_id)
//           : null,
//         district_id: user.district_id
//           ? Number(user.district_id)
//           : null,
//         zone_id: user.zone_id
//           ? Number(user.zone_id)
//           : null,
//         status: "DRAFT",
//       },
//     });

   
//     const societies =
//       await prisma.form4_filed_soc_mem_count.findMany({
//         where: {
//           form4: { uid },
//         },
//         select: {
//           id: true,
//           society_id: true,
//           society_name: true,
//           election_status: true,
//           declared_sc_st: true,
//           declared_women: true,
//           declared_general: true,
//         },
//       });

//     if (societies.length) {
//       await prisma.form6_society_decision.createMany({
//         data: societies.map(s => ({
//           form6_id: form6.id,
//           form4_filed_soc_id: s.id,
//           society_id: s.society_id ?? 0,
//           society_name: s.society_name ?? null,
//           election_action: "SHOW",
//           election_status:
//             s.election_status === "QUALIFIED"
//               ? "QUALIFIED"
//               : "UNQUALIFIED",
//           final_sc_st_count: s.declared_sc_st ?? 0,
//           final_women_count: s.declared_women ?? 0,
//           final_general_count: s.declared_general ?? 0,
//           final_total_count:
//             (s.declared_sc_st ?? 0) +
//             (s.declared_women ?? 0) +
//             (s.declared_general ?? 0),
//         })),
//       });
//     }

   
//     return {
//       form6_id: form6.id,
//       status: form6.status,
//       created_at: form6.created_at,
//     };
//   },


//   async withdrawCandidate(payload: any, uid: number) {

//     const { form6_id, form5_member_id, action } = payload;

   
//     const form6 = await prisma.form6.findFirst({
//       where: { id: form6_id, uid },
//     });

//     if (!form6) throw new Error("Invalid Form6");

//     if (form6.status === "SUBMITTED") {
//       throw new Error("Form6 already submitted");
//     }

    
//     const member = await prisma.form5.findFirst({
//       where: {
//         id: form5_member_id,
//         is_active: true,
//         form4_filed_soc_mem_count: {
//           form4: { uid },
//         },
//       },
//       select: { id: true },
//     });

//     if (!member) {
//       throw new Error("Invalid candidate");
//     }

    
//     await prisma.form6_candidate_event.create({
//       data: {
//         form6_id,
//         form5_member_id,
//         event_type: action,
//         event_by: uid,
//       },
//     });

//     return {
//       form5_member_id,
//       action,
//     };
//   },


//   async listForm6(uid: number) {

   
//     const form6 = await prisma.form6.findFirst({
//       where: {
//         uid,
//         status: "SUBMITTED",
//       },
//       include: {
//         form6_society_decision: true,
//       },
//     });

//     if (!form6) {
//       throw new Error("Form6 not submitted yet");
//     }

    
//     const [department, district, zone] = await Promise.all([
//       form6.department_id
//         ? prisma.department.findUnique({
//             where: { id: form6.department_id },
//             select: { id: true, name: true },
//           })
//         : null,
//       form6.district_id
//         ? prisma.district.findUnique({
//             where: { id: form6.district_id },
//             select: { id: true, name: true },
//           })
//         : null,
//       form6.zone_id
//         ? prisma.zone.findUnique({
//             where: { id: form6.zone_id },
//             select: { id: true, name: true },
//           })
//         : null,
//     ]);

    
//     const events = await prisma.form6_candidate_event.findMany({
//       where: { form6_id: form6.id },
//       orderBy: { event_at: "desc" },
//     });

//     const latestEventMap = new Map<number, any>();

//     for (const e of events) {
//       if (!latestEventMap.has(e.form5_member_id)) {
//         latestEventMap.set(e.form5_member_id, e);
//       }
//     }

    
//     const members = await prisma.form5.findMany({
//       where: {
//         is_active: true,
//         form4_filed_soc_mem_count: {
//           form4: { uid },
//         },
//       },
//       include: {
//         form4_filed_soc_mem_count: {
//           select: {
//             id: true,
//             society_id: true,
//             society_name: true,
//           },
//         },
//       },
//     });

    
//     const societyMemberMap: Record<number, any[]> = {};

//     for (const m of members) {
//       const lastEvent = latestEventMap.get(m.id);

//       const isWithdrawn = lastEvent?.event_type === "WITHDRAW";

//       const socId = m.form4_filed_soc_mem_count.id;

//       if (!societyMemberMap[socId]) {
//         societyMemberMap[socId] = [];
//       }

//       societyMemberMap[socId].push({
//         form5_member_id: m.id,
//         category_type: m.category_type,
//         member_name: m.member_name,
//         aadhar_no: m.aadhar_no,
//         status: isWithdrawn ? "WITHDRAWN" : "ACTIVE",
//         event: lastEvent
//           ? {
//               type: lastEvent.event_type,
//               at: lastEvent.event_at,
//               by: lastEvent.event_by,
//             }
//           : null,
//       });
//     }

   
//     const societies = form6.form6_society_decision.map(s => ({
//       form4_filed_soc_id: s.form4_filed_soc_id,
//       society_id: s.society_id,
//       society_name: cleanText(s.society_name),
//       election_action: s.election_action,
//       election_status: s.election_status,
//       final_counts: {
//         sc_st: s.final_sc_st_count ?? 0,
//         women: s.final_women_count ?? 0,
//         general: s.final_general_count ?? 0,
//         total: s.final_total_count ?? 0,
//       },
//       candidates: societyMemberMap[s.form4_filed_soc_id] ?? [],
//     }));

//     return {
//       form6: {
//         id: form6.id,
//         status: form6.status,
//         submitted_at: form6.submitted_at,
//       },
//       department: department
//         ? { id: department.id, name: cleanText(department.name) }
//         : null,
//       district: district
//         ? { id: district.id, name: cleanText(district.name) }
//         : null,
//       zone: zone
//         ? { id: zone.id, name: cleanText(zone.name) }
//         : null,
//       societies,
//     };
//   },


// };



