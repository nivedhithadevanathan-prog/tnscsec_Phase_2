import { Response } from "express";
import { generatePDF } from "../../../utils/pdfGenerator";
import { getForm1ListUsecase } from "./form1.Usecase";

/*GET FORM1 PDF*/
export const getForm1PdfUsecase = async (payload: {
  uid: number;
  role: number;
  zone_id?: string;
  res: Response;
}) => {

  const { res, ...params } = payload;

  const forms = await getForm1ListUsecase(params);

  if (!forms || forms.length === 0) {
    throw new Error("No data found");
  }

  const title =
    "மாவட்ட தேர்தல் அலுவலரால் தேர்தல் அறிவிப்பு வழங்கப்பட்ட விவரம்";

  /*COLUMNS*/

  const columns = [

    { header: "வ.எண்", key: "sno", width: 25 },

    { header: "மாவட்டம்", key: "district_name", width: 60 },

    {
      header: "மாவட்ட தேர்தல் அலுவலர்\nசரகம்",
      key: "zone_name",
      width: 70,
    },

    {
      header: "தேர்தல் அறிவிப்பதற்கு\nதிட்டமிடப்பட்ட சங்கங்களின் எண்ணிக்கை",
      key: "planned_count",
      width: 70,
    },

    {
      header: "தேர்தல் ஆணையத்தால் திட்டம் வழங்கப்பட்ட\nசங்கங்களின் பெயர்",
      key: "planned_societies",
      width: "*",
    },

    {
      header: "தேர்தல் அறிவிப்பு வழங்கப்பட்ட\nசங்கங்களின் பெயர்",
      key: "announced_societies",
      width: "*",
    },

    { header: "ப.ச / ப.கு", key: "sc_st", width: 35 },

    { header: "மகளிர்", key: "women", width: 35 },

    { header: "பொது", key: "general", width: 35 },

    { header: "மொத்தம்", key: "total", width: 40 },

    {
      header: "தேர்தல் அறிவிப்பு வழங்கப்படாத\nசங்கங்களின் பெயர்",
      key: "not_announced",
      width: "*",
    },

    {
      header: "வழங்கப்படாத சங்கங்களின் எண்ணிக்கை",
      key: "not_announced_count",
      width: 50,
    },

    { header: "குறிப்பு", key: "remarks", width: 60 },
  ];

  /*ROWS*/

  const rows = forms.map((form: any, index: number) => ({

    sno: index + 1,

    district_name: form.district_name || "-",
    zone_name: form.zone_name || "-",

    planned_count: form.selected_count || 0,

    planned_societies:
      form.selected_soc?.map((s: any) => s.society_name).join("\n") || "-",

    announced_societies:
      form.selected_soc?.map((s: any) => s.society_name).join("\n") || "-",

    sc_st:
      form.selected_soc?.reduce(
        (sum: number, s: any) => sum + (s.sc_st || 0),
        0
      ) || 0,

    women:
      form.selected_soc?.reduce(
        (sum: number, s: any) => sum + (s.women || 0),
        0
      ) || 0,

    general:
      form.selected_soc?.reduce(
        (sum: number, s: any) => sum + (s.general || 0),
        0
      ) || 0,

    total:
      form.selected_soc?.reduce(
        (sum: number, s: any) =>
          sum + (s.sc_st || 0) + (s.women || 0) + (s.general || 0),
        0
      ) || 0,

    not_announced:
      form.non_selected_soc?.map((s: any) => s.society_name).join("\n") || "-",

    not_announced_count: form.non_selected_count || 0,

    remarks: form.remark || "-",
  }));

  /*PDF*/

  return generatePDF(
    res,
    title,
    columns,
    rows,
    {
      extraHeader: `துறை -- ${forms[0]?.department_name || "-"}`,

      /*ONLY GROUP HEADER (NO DUPLICATE SUBHEADER)*/
      groupHeaders: [
        { text: "", colSpan: 6 },
        {
          text: "நிர்வாகக்குழு உறுப்பினர்களின் எண்ணிக்கை",
          colSpan: 4,
        },
        { text: "", colSpan: 3 },
      ],

      
    }
  );
};