const PdfPrinter = require("pdfmake/src/printer");
import { fonts } from "./pdfFonts";
import { Response } from "express";

const printer = new PdfPrinter(fonts);

type Column = { header: string; key: string; width?: string | number };

export const generatePDF = (
  res: Response,
  title: string,
  columns: Column[],
  data: any[],
  options?: {
    extraHeader?: string;
    groupHeaders?: { text: string; colSpan: number }[];
    subHeaders?: string[];
  }
) => {
  // 🔹 Normal Header
  const tableHeaders = columns.map(col => ({
    text: col.header,
    style: "tableHeader",
    alignment: "center",
  }));

  // Fill empty cells for colspan
  const expandedGroupHeader =
    options?.groupHeaders
      ?.map(g => [
        {
          text: g.text,
          colSpan: g.colSpan,
          style: "tableHeader",
          alignment: "center",
        },
        ...Array(g.colSpan - 1).fill({}),
      ])
      .flat() || [];

  // 🔹 Sub Header Row
  const subHeaderRow =
    options?.subHeaders?.map(h => ({
      text: h,
      style: "tableHeader",
      alignment: "center",
    })) || [];

  // 🔹 Data Rows
  const tableBody = data.map(row =>
    columns.map(col => ({
      text: row[col.key]?.toString() || "-",
      style: "tableCell",
      alignment: "center",
    }))
  );

  // 🔹 Build Body
  const body: any[] = [];

  if (options?.groupHeaders) {
    body.push(expandedGroupHeader);
  }

  if (options?.subHeaders) {
    body.push(subHeaderRow);
  } else {
    body.push(tableHeaders);
  }

  body.push(...tableBody);

  // ✅ Use per-column widths if provided, else fallback to "*"
  const columnWidths = columns.map(col => col.width ?? "*");

  const docDefinition: any = {
    pageOrientation: "landscape",
    pageMargins: [20, 40, 20, 30],

    defaultStyle: {
      font: "NotoSansTamil",
      fontSize: 9,
    },

    content: [
      {
        text: title,
        style: "header",
        margin: [0, 0, 0, 5],
      },

      options?.extraHeader
        ? {
            text: options.extraHeader,
            style: "subHeader",
            margin: [0, 0, 0, 10],
          }
        : {},

      {
        table: {
          headerRows: options?.groupHeaders ? 2 : 1,
          widths: columnWidths,
          body,
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex < (options?.groupHeaders ? 2 : 1)
              ? "#eeeeee"
              : null,
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
      },
    ],

    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: "center",
      },
      subHeader: {
        fontSize: 11,
        bold: true,
        alignment: "center",
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
      },
      tableCell: {
        fontSize: 8,
      },
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  res.setHeader("Content-Type", "application/pdf");

  // ✅ ASCII-safe filename — Tamil title stays inside PDF only
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report.pdf"; filename*=UTF-8''${encodeURIComponent(title)}.pdf`
  );

  pdfDoc.pipe(res);
  pdfDoc.end();
};