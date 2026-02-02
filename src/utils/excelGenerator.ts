import ExcelJS from "exceljs";

export const generateExcelBuffer = async (data: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Form Submissions");

  worksheet.columns = [
    { header: "Serial No", key: "serialNo", width: 15 },
    { header: "Date", key: "date", width: 15 },
    { header: "District", key: "district", width: 20 },
    { header: "Society Name", key: "societyName", width: 25 },
    { header: "Petitioner Name & Address", key: "petitionerNameAddr", width: 30 },
    { header: "Brief Note", key: "briefNote", width: 30 },
    { header: "Action Taken Report", key: "actionTakenReport", width: 30 },
    { header: "Nature of Conclusion", key: "natureOfConclusion", width: 30 },
    { header: "PR No", key: "prNo", width: 15 },
    { header: "Remarks", key: "remarks", width: 20 },
    { header: "PDF File", key: "pdfFile", width: 25 },
  ];

  worksheet.addRows(data);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
