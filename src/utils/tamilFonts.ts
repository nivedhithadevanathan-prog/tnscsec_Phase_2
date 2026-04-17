

import fs from "fs";
import path from "path";

const fontPath = path.join(
  __dirname,
  "../fonts/NotoSansTamil-Regular.ttf"
);

export const tamilFont = {
  "NotoSansTamil-Regular.ttf": fs
    .readFileSync(fontPath)
    .toString("base64"),
};