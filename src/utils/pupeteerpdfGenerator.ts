import puppeteer from "puppeteer";

export const generateHtmlPdf = async (
  res: any,
  html: string,
  fileName: string
) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "domcontentloaded",
  });

const pdfBuffer = await page.pdf({
  format: "A4",
  landscape: true,
  printBackground: true,

  scale: 1,              // 🔥 IMPORTANT
  margin: {
    top: "10mm",
    bottom: "10mm",
    left: "10mm",
    right: "10mm",
  },
});

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}.pdf"`
  );

  res.send(pdfBuffer);
};