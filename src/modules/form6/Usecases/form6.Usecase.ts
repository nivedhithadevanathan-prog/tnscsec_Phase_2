import { Form6Service } from "../../form6/Services/form6.Service";
import { generatePDF } from "../../../utils/pdfGenerator"


export const Form6Usecase = {

  initForm6(uid: number) {
    return Form6Service.initForm6(uid);
  },

  loadForm6Preview(uid: number) {
    return Form6Service.loadForm6Preview(uid);
  },

  getEditableForm6(uid: number) {
    return Form6Service.getEditableForm6(uid);
  },
/*LIST FORM-6*/
listForm6(params: { uid: number; role: number; zone_id?: string }) {

  const { uid, role, zone_id } = params;

  return Form6Service.listForm6({
    uid,
    role,
    zone_id,
  });
},

  withdrawCandidate(payload: {
    uid: number;
    form4_filed_soc_id: number;
    form5_member_id: number;
  }) {
    return Form6Service.withdrawCandidate(payload);
  },

  societyDecision(payload: {
    uid: number;
    form4_filed_soc_id: number;
    election_action: "SHOW" | "STOP";
  }) {
    return Form6Service.societyDecision(payload);
  },

  editForm6(payload: {
    uid: number;
    societies: {
      form4_filed_soc_id: number;
      election_action: "SHOW" | "STOP";
    }[];
  }) {
    return Form6Service.editForm6(payload);
  },

  submitForm6(uid: number) {
    return Form6Service.submitForm6(uid);
  },

/*PDF DOWNLOAD*/
async getForm6Pdf(params: { 
  uid: number; 
  role: number; 
  zone_id?: string; 
  res: any;
}) {

  const { uid, role, zone_id, res } = params;

  // SERVICE CALL
  const { form4, societies, members, events } =
    await Form6Service.getForm6FullPdfData({
      uid,
      role,
      zone_id,
    });

  if (!form4 || !societies?.length) {
    throw new Error("No Form6 data found");
  }

  const rows: any[] = [];
  let count = 1;

  /*DATA TRANSFORM */

  for (const soc of societies) {

    const socMembers = members.filter(
      (m: any) => m.form4_filed_soc_id === soc.id
    );

    const withdrawn = socMembers.filter((m: any) =>
      events.some((e: any) =>
        e.form5_member_id === m.id &&
        e.event_type === "WITHDRAW"
      )
    );

    const active = socMembers.filter(
      (m: any) => !withdrawn.find((w: any) => w.id === m.id)
    );

    const countBy = (list: any[], type: string) =>
      list.filter(m => m.category_type === type).length;

    rows.push({
      sno: count++,
      district: form4.district_name,
      zone: form4.zone_name,
      society: soc.society_name,

      // Withdrawn
      w_sc: countBy(withdrawn, "sc_st"),
      w_women: countBy(withdrawn, "women"),
      w_gen: countBy(withdrawn, "general"),
      w_total: withdrawn.length,

      // Final
      f_sc: countBy(active, "sc_st"),
      f_women: countBy(active, "women"),
      f_gen: countBy(active, "general"),
      f_total: active.length,

      // Equal (TEMP)
      e_sc: 0,
      e_women: 0,
      e_gen: 0,
      e_total: 0,

      // Less (TEMP)
      l_sc: 0,
      l_women: 0,
      l_gen: 0,
      l_total: 0,
    });
  }

  /*PDF*/

  return generatePDF(
    res,
    "வேட்புமனு திரும்ப பெறுதல் மற்றும் இறுதி போட்டியிடும் வேட்பாளர்கள் பற்றிய முழு விவரங்கள்",

    [
      { header: "வ.எண்", key: "sno" },
      { header: "மாவட்டம்", key: "district" },
      { header: "சரகம்", key: "zone" },
      { header: "சங்கம்", key: "society" },

      { header: "ப.இ./ப.கு", key: "w_sc" },
      { header: "பெண்கள்", key: "w_women" },
      { header: "பொது", key: "w_gen" },
      { header: "மொத்தம்", key: "w_total" },

      { header: "ப.இ./ப.கு", key: "f_sc" },
      { header: "பெண்கள்", key: "f_women" },
      { header: "பொது", key: "f_gen" },
      { header: "மொத்தம்", key: "f_total" },

      { header: "ப.இ./ப.கு", key: "e_sc" },
      { header: "பெண்கள்", key: "e_women" },
      { header: "பொது", key: "e_gen" },
      { header: "மொத்தம்", key: "e_total" },

      { header: "ப.இ./ப.கு", key: "l_sc" },
      { header: "பெண்கள்", key: "l_women" },
      { header: "பொது", key: "l_gen" },
      { header: "மொத்தம்", key: "l_total" },
    ],

    rows,

    {
      extraHeader: `மாவட்டம்: ${form4.district_name} | சரகம்: ${form4.zone_name}`,

      groupHeaders: [
        { text: " ", colSpan: 4 },

        { text: "திரும்ப பெற்றவை", colSpan: 4 },
        { text: "இறுதி போட்டியாளர்", colSpan: 4 },
        { text: "சம நிலை", colSpan: 4 },
        { text: "குறைவு நிலை", colSpan: 4 },
      ],

      subHeaders: [
        "", "", "", "",
        "ப.இ./ப.கு", "பெண்கள்", "பொது", "மொத்தம்",
        "ப.இ./ப.கு", "பெண்கள்", "பொது", "மொத்தம்",
        "ப.இ./ப.கு", "பெண்கள்", "பொது", "மொத்தம்",
        "ப.இ./ப.கு", "பெண்கள்", "பொது", "மொத்தம்",
      ],
    }
  );
},


};
