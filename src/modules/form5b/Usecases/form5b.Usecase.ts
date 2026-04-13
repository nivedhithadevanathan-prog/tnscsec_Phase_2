import { Form5BService } from "../../form5b/Services/form5b.Service";
import { generatePDF } from "../../../utils/pdfGenerator"
export const Form5BUsecase = {

  /*GET Form5B Preview*/
  getPreview(uid: number) {
    return Form5BService.getPreview(uid);
  },

  /*POST Stop Societies*/
  stopSocieties(payload: {
    uid: number;
    societies: any[];
  }) {
    return Form5BService.stopSocieties(payload);
  },

stopCandidates(payload: {
  uid: number;
  candidates: any[];
}) {
  return Form5BService.stopCandidates(payload);
},

submitForm5B(uid: number) {
  return Form5BService.submitForm5B(uid);
},

/*GET Form5B list*/
getForm5BListByUser(params: { uid: number; role: number; zone_id?: string; }) {

  const { uid, role, zone_id } = params;

  return Form5BService.getForm5BListByUser({
    uid,
    role,
    zone_id,  
  });

},

/*GET Editable Form5B*/
getEditableForm5BByUser(params: { uid: number; role: number }) {

  const { uid, role } = params;

  return Form5BService.getEditableForm5BByUser({
    uid,
    role,
  });

},

/*PUT Edit Form5B*/
editForm5B(payload: {
  uid: number;
  role: number;
  societies: any[];
  candidates: any[];
}) {
  return Form5BService.editForm5B(payload);
},

async getForm5BPdf(params: { 
  uid: number; 
  role: number; 
  zone_id?: string; 
  res: any;
}) {

  const { uid, role, zone_id, res } = params;

  const data = await Form5BService.getForm5BPdf({
    uid,
    role,
    zone_id,
  });

  if (!data || data.length === 0) {
    throw new Error("No data found");
  }

  const rows: any[] = [];
  let count = 1;

  for (const item of data) {

    const district = item.form4.district_name;
    const zone = item.form4.zone_name;

    for (const soc of item.societies) {

      rows.push({
        sno: count++,
        district,
        zone,

        total_societies: 1, // per row
        sc_st: soc.members.sc_st.length,
        women: soc.members.women.length,
        general: soc.members.general.length,

       remaining_sc_st: soc.members.sc_st.filter((m: any) => m.is_active).length,
       remaining_women: soc.members.women.filter((m: any) => m.is_active).length,
       remaining_general: soc.members.general.filter((m: any) => m.is_active).length,

        stopped_society: soc.is_stopped ? soc.society_name : "-",
      });

    }
  }

  return generatePDF(
    res,
    "வேட்புமனு பரிசீலனை மற்றும் செல்லத்தக்க வேட்புமனுக்கள் பட்டியல்",
    [
      { header: "வ.எண்", key: "sno" },
      { header: "மாவட்டம்", key: "district" },
      { header: "சரகம்", key: "zone" },

      { header: "சங்கங்கள்", key: "total_societies" },
      { header: "ப.இ./ப.கு", key: "sc_st" },
      { header: "பெண்கள்", key: "women" },
      { header: "பொது", key: "general" },

      { header: "ப.இ./ப.கு", key: "remaining_sc_st" },
      { header: "பெண்கள்", key: "remaining_women" },
      { header: "பொது", key: "remaining_general" },

      { header: "நிறுத்தப்பட்ட சங்கம்", key: "stopped_society" },
    ],
    rows,
    {
      extraHeader: "துறை -- Cooperative Department",

      groupHeaders: [
        { text: "", colSpan: 3 },
        { text: "தகுதி பெற்ற சங்கங்கள் எண்ணிக்கை", colSpan: 4 },
        { text: "தள்ளுபடி / நிறுத்தல் பின்னர் எண்ணிக்கை", colSpan: 3 },
        { text: "தேர்தல் நிறுத்தப்பட்ட சங்கங்கள்", colSpan: 1 },
      ],

      subHeaders: [
        "வ.எண்",
        "மாவட்டம்",
        "சரகம்",

        "சங்கங்கள்",
        "ப.இ./ப.கு",
        "பெண்கள்",
        "பொது",

        "ப.இ./ப.கு",
        "பெண்கள்",
        "பொது",

        "சங்கத்தின் பெயர்",
      ],
    }
  );
},

};