// import prisma from "../../shared/prisma";

// type CategoryKey = "SC_ST" | "WOMEN" | "GENERAL";
// const CATEGORIES: CategoryKey[] = ["SC_ST", "WOMEN", "GENERAL"];

// export const Form8Service = {

//   async getPreview(uid: number) {

//     const user = await prisma.users.findUnique({
//       where: { id: uid },
//       select: { district_id: true }
//     });
//     if (!user?.district_id) throw new Error("User district not found");

//     const latestForm4 = await prisma.form4.findFirst({
//       where: { uid, district_id: user.district_id },
//       orderBy: { id: "desc" },
//       select: { id: true }
//     });
//     if (!latestForm4) throw new Error("Form4 not found");

//     const form7Societies = await prisma.form7_societies.findMany({
//       where: { form7: { district_id: user.district_id } },
//       orderBy: { id: "asc" }
//     });

//     const uniqueSocieties = [
//       ...new Map(form7Societies.map(s => [s.society_id, s])).values()
//     ];

//     const filedSocieties = await prisma.form4_filed_soc_mem_count.findMany({
//       where: {
//         form4_id: latestForm4.id,
//         society_id: { in: uniqueSocieties.map(s => s.society_id) }
//       }
//     });

//     const filedSocMap = new Map(filedSocieties.map(f => [f.society_id, f]));

//     const candidates = await prisma.form5.findMany({
//       where: {
//         is_active: true,
//         form4_filed_soc_id: { in: filedSocieties.map(f => f.id) }
//       },
//       select: {
//         id: true,
//         form4_filed_soc_id: true,
//         category_type: true,
//         member_name: true
//       }
//     });

//     const withdrawals = await prisma.form6_candidate_event.findMany({
//       where: { form5_member_id: { in: candidates.map(c => c.id) } },
//       orderBy: { event_at: "desc" }
//     });

//     const withdrawnSet = new Set(
//       withdrawals
//         .filter(w => w.event_type === "WITHDRAW")
//         .map(w => w.form5_member_id)
//     );

//     const memberMap = new Map<number, Record<CategoryKey, any[]>>();

//     for (const c of candidates) {
//       if (withdrawnSet.has(c.id)) continue;
//       if (!c.category_type) continue;

//       const cat = c.category_type as CategoryKey;

//       if (!memberMap.has(c.form4_filed_soc_id)) {
//         memberMap.set(c.form4_filed_soc_id, {
//           SC_ST: [],
//           WOMEN: [],
//           GENERAL: []
//         });
//       }

//       memberMap.get(c.form4_filed_soc_id)![cat].push({
//         form5_member_id: c.id,
//         member_name: c.member_name
//       });
//     }

//     const polled_societies: any[] = [];
//     const stopped_52_18: any[] = [];
//     const stopped_52A_6: any[] = [];

//     for (const s of uniqueSocieties) {

//       const base = {
//         form7_society_id: s.id,
//         society_id: s.society_id,
//         society_name: s.society_name,
//         casted_votes_count: s.casted_votes_count ?? 0,
//         polling_suspension_count: s.polling_suspension_count
//       };

//       if (s.polling_suspension_count === "RULE_52_18") {
//         stopped_52_18.push(base);
//         continue;
//       }
//       if (s.polling_suspension_count === "RULE_52A_6") {
//         stopped_52A_6.push(base);
//         continue;
//       }
//       if (s.polling_suspension_count !== "NO_ISSUES") continue;

//       const filedSoc = filedSocMap.get(s.society_id);
//       if (!filedSoc) continue;

//       polled_societies.push({
//         ...base,
//         rural: {
//           sc_st: filedSoc.rural_sc_st ?? 0,
//           women: filedSoc.rural_women ?? 0,
//           general: filedSoc.rural_general ?? 0
//         },
//         declared: {
//           sc_st: filedSoc.declared_sc_st ?? 0,
//           women: filedSoc.declared_women ?? 0,
//           general: filedSoc.declared_general ?? 0
//         },
//         members: memberMap.get(filedSoc.id) ?? {
//           SC_ST: [],
//           WOMEN: [],
//           GENERAL: []
//         }
//       });
//     }

//     return {
//       polled_societies,
//       stopped_elections: {
//         RULE_52_18: stopped_52_18,
//         RULE_52A_6: stopped_52A_6
//       }
//     };
//   },

//   async listForm8(uid: number) {

//     const user = await prisma.users.findUnique({
//       where: { id: uid },
//       select: { district_id: true }
//     });
//     if (!user?.district_id) throw new Error("User district not found");

//     const form8List = await prisma.form8.findMany({
//       where: { district_id: user.district_id },
//       orderBy: { id: "desc" }
//     });

//     const response: any[] = [];

//     for (const form8 of form8List) {

//       const pollingRows = await prisma.form8_polling_details.findMany({
//         where: { form8_id: form8.id },
//         include: { form7_societies: true }
//       });

//       const societies: any[] = [];

//       for (const ps of pollingRows) {

//         const soc = ps.form7_societies;

//         const filed = await prisma.form4_filed_soc_mem_count.findFirst({
//           where: { society_id: soc.society_id },
//           orderBy: { id: "desc" }
//         });
//         if (!filed) continue;

//         const rural = {
//           SC_ST: filed.rural_sc_st ?? 0,
//           WOMEN: filed.rural_women ?? 0,
//           GENERAL: filed.rural_general ?? 0
//         };

//         const declared = {
//           SC_ST: filed.declared_sc_st ?? 0,
//           WOMEN: filed.declared_women ?? 0,
//           GENERAL: filed.declared_general ?? 0
//         };

//         const candidates = await prisma.form5.findMany({
//           where: {
//             form4_filed_soc_id: filed.id,
//             is_active: true
//           },
//           select: {
//             id: true,
//             member_name: true,
//             aadhar_no: true,
//             category_type: true
//           }
//         });

//         const winnersData = await prisma.form8_final_result.findMany({
//           where: {
//             form8_id: form8.id,
//             form7_society_id: soc.id
//           }
//         });

//         const categories: any[] = [];

//         for (const cat of CATEGORIES) {

//           const isElection = declared[cat] > rural[cat];
//           let winners;

//           if (isElection) {
//             const ids = winnersData
//               .filter(w => w.category_type === cat)
//               .map(w => w.form5_member_id);

//             winners = candidates.filter(c => ids.includes(c.id));
//           } else {
//            winners = candidates.filter(
//   c => c.category_type && c.category_type.toUpperCase() === cat
// );
// ;
//           }

//           categories.push({
//             category: cat,
//             election: isElection,
//             winners: winners.map(w => ({
//               form5_member_id: w.id,
//               member_name: w.member_name,
//               aadhar_no: w.aadhar_no
//             }))
//           });
//         }

//         societies.push({
//           society_id: soc.society_id,
//           society_name: soc.society_name,
//           rural,
//           categories
//         });
//       }

//       response.push({
//         form8_id: form8.id,
//         district_name: form8.district_name,
//         societies
//       });
//     }

//     return response;
//   }
// };
