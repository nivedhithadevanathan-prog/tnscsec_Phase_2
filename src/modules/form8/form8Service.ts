import prisma from "../../shared/prisma";


type CategoryKey = "SC_ST" | "WOMEN" | "GENERAL";
const CATEGORIES: CategoryKey[] = ["SC_ST", "WOMEN", "GENERAL"];

export const Form8Service = {


   
  
async getPreview(uid: number) {

    
    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: { district_id: true }
    });

    if (!user?.district_id) {
      throw new Error("User district not found");
    }

    
    const latestForm4 = await prisma.form4.findFirst({
      where: {
        uid,
        district_id: user.district_id
      },
      orderBy: { id: "desc" },
      select: { id: true }
    });

    if (!latestForm4) {
      throw new Error("Form4 not found for user");
    }

    
    const form7Societies = await prisma.form7_societies.findMany({
      where: {
        form7: {
          district_id: user.district_id
        }
      },
      orderBy: { id: "asc" }
    });

    
    const societyMap = new Map<number, typeof form7Societies[0]>();
    for (const s of form7Societies) {
      societyMap.set(s.society_id, s);
    }
    const uniqueSocieties = Array.from(societyMap.values());

   
    const filedSocieties = await prisma.form4_filed_soc_mem_count.findMany({
      where: {
        form4_id: latestForm4.id,
        society_id: {
          in: uniqueSocieties.map(s => s.society_id)
        }
      },
      select: {
        id: true,
        society_id: true,

        
        rural_sc_st: true,
        rural_women: true,
        rural_general: true,

        declared_sc_st: true,
        declared_women: true,
        declared_general: true
      }
    });

    const filedSocMap = new Map<number, typeof filedSocieties[0]>();
    for (const fs of filedSocieties) {
      filedSocMap.set(fs.society_id, fs);
    }

    const candidates = await prisma.form5.findMany({
      where: {
        is_active: true,
        form4_filed_soc_id: {
          in: filedSocieties.map(f => f.id)
        }
      },
      select: {
        id: true,
        form4_filed_soc_id: true,
        category_type: true, 
        member_name: true
      },
      orderBy: { created_at: "asc" }
    });

    
    const withdrawals = await prisma.form6_candidate_event.findMany({
      where: {
        form5_member_id: {
          in: candidates.map(c => c.id)
        }
      },
      orderBy: { event_at: "desc" }
    });

    const withdrawnSet = new Set<number>();
    for (const w of withdrawals) {
      if (w.event_type === "WITHDRAW") {
        withdrawnSet.add(w.form5_member_id);
      }
    }

    
    const memberMap = new Map<number, any>();

    for (const c of candidates) {

      if (withdrawnSet.has(c.id)) continue;

      if (!memberMap.has(c.form4_filed_soc_id)) {
        memberMap.set(c.form4_filed_soc_id, {
          SC_ST: [],
          WOMEN: [],
          GENERAL: []
        });
      }

      const categoryKey = c.category_type.toUpperCase(); // FIXED

      memberMap.get(c.form4_filed_soc_id)[categoryKey].push({
        form5_member_id: c.id,
        member_name: c.member_name
      });
    }

    
    const polled_societies: any[] = [];
    const stopped_52_18: any[] = [];
    const stopped_52A_6: any[] = [];

    for (const s of uniqueSocieties) {

      const base = {
        form7_society_id: s.id,
        society_id: s.society_id,
        society_name: s.society_name,
        casted_votes_count: s.casted_votes_count ?? 0,
        polling_suspension_count: s.polling_suspension_count
      };

      
      if (s.polling_suspension_count === "RULE_52_18") {
        stopped_52_18.push(base);
        continue;
      }

      if (s.polling_suspension_count === "RULE_52A_6") {
        stopped_52A_6.push(base);
        continue;
      }

      if (s.polling_suspension_count !== "NO_ISSUES") continue;

      const filedSoc = filedSocMap.get(s.society_id);
      if (!filedSoc) continue;

      polled_societies.push({
        ...base,

        
        rural: {
          sc_st: filedSoc.rural_sc_st ?? 0,
          women: filedSoc.rural_women ?? 0,
          general: filedSoc.rural_general ?? 0
        },

        
        declared: {
          sc_st: filedSoc.declared_sc_st ?? 0,
          women: filedSoc.declared_women ?? 0,
          general: filedSoc.declared_general ?? 0
        },

        
        members: memberMap.get(filedSoc.id) ?? {
          SC_ST: [],
          WOMEN: [],
          GENERAL: []
        }
      });
    }

    
    return {
      polled_societies,
      stopped_elections: {
        RULE_52_18: stopped_52_18,
        RULE_52A_6: stopped_52A_6
      }
    };
  },


 

  
  async checkboxPreview(payload: any, uid: number) {

    const result: any[] = [];

    for (const soc of payload.societies) {

      const form7Soc = await prisma.form7_societies.findUnique({
        where: { id: soc.form7_society_id }
      });

      if (!form7Soc)
        throw new Error("Invalid Form7 society");

      if (form7Soc.polling_suspension_count !== "NO_ISSUES")
        throw new Error("Society not eligible");

      const seatLimit = {
        SC_ST: form7Soc.final_sc_st_count ?? 0,
        WOMEN: form7Soc.final_women_count ?? 0,
        GENERAL: form7Soc.final_general_count ?? 0
      };

      const selectedCount: Record<string, number> = {};
      const selected: any[] = [];
      const rejected: any[] = [];

      for (const w of soc.winners) {

        const lastEvent = await prisma.form6_candidate_event.findFirst({
          where: { form5_member_id: w.form5_member_id },
          orderBy: { event_at: "desc" }
        });

        if (lastEvent?.event_type === "WITHDRAW") {
          rejected.push({
            form5_member_id: w.form5_member_id,
            reason: "WITHDRAWN"
          });
          continue;
        }

        selectedCount[w.category_type] =
          (selectedCount[w.category_type] || 0) + 1;

        selected.push(w);
      }

      for (const cat of Object.keys(selectedCount)) {
        if (selectedCount[cat] > seatLimit[cat as keyof typeof seatLimit]) {
          throw new Error(
            `Seat exceeded for ${cat} in ${form7Soc.society_name}`
          );
        }
      }

      result.push({
        form7_society_id: soc.form7_society_id,
        seat_limit: seatLimit,
        selected,
        rejected
      });
    }

    return result;
  },

  
  


  async submitForm8(payload: any, uid: number) {

    return prisma.$transaction(async (tx) => {

      
      const user = await tx.users.findUnique({
        where: { id: uid },
        select: { district_id: true }
      });

      if (!user?.district_id) {
        throw new Error("User district not found");
      }

      const district = await tx.district.findUnique({
        where: { id: user.district_id },
        select: { name: true }
      });

      
      const form8 = await tx.form8.create({
        data: {
          district_id: user.district_id,
          district_name: district?.name ?? ""
        }
      });

      
      for (const soc of payload.societies) {

        const {
          form7_society_id,
          polling_details,
          winners
        } = soc;

        
        const form7Soc = await tx.form7_societies.findUnique({
          where: { id: form7_society_id }
        });

        if (!form7Soc) {
          throw new Error(`Invalid form7_society_id: ${form7_society_id}`);
        }

        
        const filedSoc = await tx.form4_filed_soc_mem_count.findFirst({
          where: {
            society_id: form7Soc.society_id,
            form4: { uid }
          },
          orderBy: { id: "desc" }
        });

        if (!filedSoc) {
          throw new Error(
            `Filed society not found for society_id ${form7Soc.society_id}`
          );
        }

       
        const seatLimit: Record<CategoryKey, number> = {
          SC_ST: filedSoc.rural_sc_st ?? 0,
          WOMEN: filedSoc.rural_women ?? 0,
          GENERAL: filedSoc.rural_general ?? 0
        };

        
        const eligibleCategory: Record<CategoryKey, boolean> = {
          SC_ST: (filedSoc.declared_sc_st ?? 0) > (filedSoc.rural_sc_st ?? 0),
          WOMEN: (filedSoc.declared_women ?? 0) > (filedSoc.rural_women ?? 0),
          GENERAL: (filedSoc.declared_general ?? 0) > (filedSoc.rural_general ?? 0)
        };

       
        for (const category of CATEGORIES) {

          const selectedCount = winners[category]?.length ?? 0;

          if (eligibleCategory[category]) {
            
            if (selectedCount !== seatLimit[category]) {
              throw new Error(
                `Seat mismatch for ${category} in society ${form7Soc.society_name}`
              );
            }
          } else {
            
            if (selectedCount !== 0) {
              throw new Error(
                `No winners allowed for ${category} in society ${form7Soc.society_name}`
              );
            }
          }
        }

        
        await tx.form8_polling_details.create({
          data: {
            form8_id: form8.id,
            form7_society_id,
            ballot_votes_at_counting: polling_details.ballot_votes_at_counting,
            valid_votes: polling_details.valid_votes,
            invalid_votes: polling_details.invalid_votes,
            remarks: polling_details.remarks ?? null
          }
        });

        
        for (const category of CATEGORIES) {
          for (const w of winners[category]) {
            await tx.form8_final_result.create({
              data: {
                form8_id: form8.id,
                form7_society_id,
                form5_member_id: w.form5_member_id,
                category_type: category 
              }
            });
          }
        }
      }

      
      return {
        form8_id: form8.id,
        societies_count: payload.societies.length
      };
    });
  },





async listForm8(uid: number) {

  
  const user = await prisma.users.findUnique({
    where: { id: uid },
    select: { district_id: true }
  });

  if (!user?.district_id) {
    throw new Error("User district not found");
  }

 
  const form8List = await prisma.form8.findMany({
    where: { district_id: user.district_id },
    orderBy: { id: "desc" }
  });

  const response: any[] = [];

  for (const form8 of form8List) {

    
    const pollingRows = await prisma.form8_polling_details.findMany({
      where: { form8_id: form8.id },
      include: {
        form7_societies: true
      }
    });

    const societies: any[] = [];

    for (const ps of pollingRows) {

      const soc = ps.form7_societies;

      
      const filed = await prisma.form4_filed_soc_mem_count.findFirst({
        where: { society_id: soc.society_id },
        orderBy: { id: "desc" }
      });

      if (!filed) continue;

      
      const rural = {
        SC_ST: filed.rural_sc_st ?? 0,
        WOMEN: filed.rural_women ?? 0,
        GENERAL: filed.rural_general ?? 0
      };

      
      const declared = {
        SC_ST: filed.declared_sc_st ?? 0,
        WOMEN: filed.declared_women ?? 0,
        GENERAL: filed.declared_general ?? 0
      };

      
      const candidates = await prisma.form5.findMany({
        where: {
          form4_filed_soc_id: filed.id,
          is_active: true
        },
        select: {
          id: true,
          member_name: true,
          aadhar_no: true,
          category_type: true
        }
      });

      
      const winnersData = await prisma.form8_final_result.findMany({
        where: {
          form8_id: form8.id,
          form7_society_id: soc.id
        }
      });

      const categories: any[] = [];

      for (const cat of ["SC_ST", "WOMEN", "GENERAL"] as const) {

        const isElection = declared[cat] > rural[cat];

        let winners;

        if (isElection) {
          const ids = winnersData
            .filter(w => w.category_type === cat)
            .map(w => w.form5_member_id);

          winners = candidates.filter(c => ids.includes(c.id));
        } else {
          
          winners = candidates.filter(
            c => c.category_type.toUpperCase() === cat
          );
        }

        categories.push({
          category: cat,
          election: isElection,
          winners: winners.map(w => ({
            form5_member_id: w.id,
            member_name: w.member_name,
            aadhar_no: w.aadhar_no
          }))
        });
      }

      societies.push({
        society_id: soc.society_id,
        society_name: soc.society_name,

        
        rural,

        categories
      });
    }

    response.push({
      form8_id: form8.id,
      district_name: form8.district_name,
      societies
    });
  }

  return response;
}
};







