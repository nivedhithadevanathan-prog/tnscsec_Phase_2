import prisma from "../../shared/prisma";

export const Form5Service = {

  
  async getEligibleForm5(uid: number) {
    const rows = await prisma.form4_filed_soc_mem_count.findMany({
      where: {
        form4: { uid }
      }
    });

    return rows.map(row => ({
      filed_soc_id: row.id,
      society_id: row.society_id,
      society_name: cleanText(row.society_name),
      election_status: row.election_status,
      declared: {
        sc_st: row.declared_sc_st ?? 0,
        women: row.declared_women ?? 0,
        general: row.declared_general ?? 0
      },
      rural: {
        sc_st: row.rural_sc_st ?? 0,
        women: row.rural_women ?? 0,
        general: row.rural_general ?? 0
      }
    }));
  },

  
  async submitForm5(payload: any, uid: number) {
    const { members } = payload;

    return prisma.$transaction(async (tx) => {

      for (const m of members) {

        const filed = await tx.form4_filed_soc_mem_count.findFirst({
          where: {
            id: Number(m.form4_filed_soc_id),
            form4: { uid }
          }
        });

        if (!filed) {
          throw new Error("Invalid society");
        }

        // STRICT VALIDATION ONLY FOR QUALIFIED
        if (filed.election_status === "QUALIFIED") {

          const declared =
            m.category_type === "sc_st"
              ? filed.declared_sc_st ?? 0
              : m.category_type === "women"
              ? filed.declared_women ?? 0
              : filed.declared_general ?? 0;

          const existingCount = await tx.form5.count({
            where: {
              form4_filed_soc_id: filed.id,
              category_type: m.category_type,
              is_active: true
            }
          });

          if (existingCount + 1 > declared) {
            throw new Error(
              `Exceeded declared count for ${m.category_type}`
            );
          }
        }

        // SAVE FOR ALL STATUSES
        await tx.form5.create({
          data: {
            form4_filed_soc_id: filed.id,
            category_type: m.category_type,
            member_name: m.member_name,
            aadhar_no: m.aadhar_no
          }
        });
      }

      return { inserted: members.length };
    });
  },

 
  async listForm5(uid: number) {

    const rows = await prisma.form5.findMany({
      where: {
        is_active: true,
        form4_filed_soc_mem_count: {
          form4: { uid }
        }
      },
      include: {
        form4_filed_soc_mem_count: {
          select: {
            id: true,
            society_name: true,
            election_status: true,
            declared_sc_st: true,
            declared_women: true,
            declared_general: true,
            rural_sc_st: true,
            rural_women: true,
            rural_general: true,
            form4: {
              select: {
                department_id: true,
                district_id: true,
                zone_id: true
              }
            }
          }
        }
      },
      orderBy: { created_at: "asc" }
    });

    if (!rows.length) {
      return { members: [] };
    }

    const f4 = rows[0].form4_filed_soc_mem_count.form4;

    const [department, district, zone] = await Promise.all([
      f4.department_id
        ? prisma.department.findUnique({ where: { id: f4.department_id } })
        : null,
      f4.district_id
        ? prisma.district.findUnique({ where: { id: f4.district_id } })
        : null,
      f4.zone_id
        ? prisma.zone.findUnique({ where: { id: f4.zone_id } })
        : null
    ]);

    const members = rows.map(r => ({
      id: r.id,
      form4_filed_soc_id: r.form4_filed_soc_id,
      society_name: cleanText(r.form4_filed_soc_mem_count.society_name),
      election_status: r.form4_filed_soc_mem_count.election_status,
      category_type: r.category_type,
      member_name: r.member_name,
      aadhar_no: r.aadhar_no
    }));

    return {
      department_id: department?.id ?? null,
      department_name: cleanText(department?.name),
      district_id: district?.id ?? null,
      district_name: cleanText(district?.name),
      zone_id: zone?.id ?? null,
      zone_name: cleanText(zone?.name),
      members
    };
  },
 
async getEditableForm5(uid: number) { 
  const members = await prisma.form5.findMany({
    where: {
      is_active: true,
      form4_filed_soc_mem_count: {
        form4: { uid }
      }
    },
    select: {
      id: true,
      form4_filed_soc_id: true,
      category_type: true,
      member_name: true,
      aadhar_no: true
    },
    orderBy: { created_at: "asc" }
  });

  return {
    editable: true,
    members
  };
},


  
 async editForm5(payload: any, uid: number) {
  const { updates } = payload;

  return prisma.$transaction(async (tx) => {
    for (const u of updates) {
      const updated = await tx.form5.updateMany({
        where: {
          id: Number(u.form5_id),
          is_active: true,
          form4_filed_soc_mem_count: {
            form4: { uid }
          }
        },
        data: {
          member_name: u.member_name,
          aadhar_no: u.aadhar_no
        }
      });

      if (!updated.count) {
        throw new Error(`Form5 record ${u.form5_id} not editable`);
      }
    }

    return { updated: updates.length };
  });
}

};

function cleanText(text?: string | null) {
  if (!text) return text;
  return text.replace(/[\r\n]+/g, " ").trim();
}
