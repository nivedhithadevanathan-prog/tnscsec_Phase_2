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

  /*HEADERS*/

  const tableHeaders = columns.map(col => ({
    text: col.header,
    style: "tableHeader",
    alignment: "center",
  }));

  // GROUP HEADER (colspan fix)
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

  //SUB HEADER
  const subHeaderRow =
    options?.subHeaders?.map(h => ({
      text: h,
      style: "tableHeader",
      alignment: "center",
    })) || [];

  /*DATA*/

  const tableBody = data.map(row =>
    columns.map(col => ({
      text: row[col.key]?.toString() || "-",
      style: "tableCell",
      alignment: "center",
      noWrap: false, 
    }))
  );

  /*BUILD BODY*/

  const body: any[] = [];

  if (options?.groupHeaders) {
    body.push(expandedGroupHeader);
  }

  // ALWAYS ADD MAIN HEADERS
  body.push(tableHeaders);

  if (options?.subHeaders) {
    body.push(subHeaderRow);
  }

  body.push(...tableBody);

  /*WIDTHS*/

  const columnWidths = columns.map(col => col.width ?? "*");

  /*DOC*/

  const docDefinition: any = {
    pageOrientation: "landscape", 
    pageSize: "A4",
    pageMargins: [10, 30, 10, 20],
    defaultStyle: {
      font: "NotoSansTamil",
      fontSize: 7, 
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
          headerRows:
            (options?.groupHeaders ? 1 : 0) +
            1 +
            (options?.subHeaders ? 1 : 0),

          widths: columnWidths,

          body,
        },

        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex <
            ((options?.groupHeaders ? 1 : 0) +
              1 +
              (options?.subHeaders ? 1 : 0))
              ? "#eeeeee"
              : null,

          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,

          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
    ],

    styles: {
      header: {
        fontSize: 13,
        bold: true,
        alignment: "center",
      },
      subHeader: {
        fontSize: 10,
        bold: true,
        alignment: "center",
      },
      tableHeader: {
        bold: true,
        fontSize: 8,
      },
      tableCell: {
        fontSize: 7,
        // noWrap: false,
      },
    },
  };

  /*CREATE*/

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report.pdf"`
  );

  pdfDoc.pipe(res);
  pdfDoc.end();
};