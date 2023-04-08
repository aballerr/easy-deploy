import path from "path";
import fs from "fs";

export const findRootDir = () => {
  let currentDir = process.cwd();

  console.log(currentDir);

  console.log(__dirname);

  // let rootDir = "";
  // while (currentDir !== "/") {
  //     if (fs.existsSync(path.join(currentDir, "package.json"))) {
  //     rootDir = currentDir;
  //     break;
  //     }
  //     currentDir = path.join(currentDir, "../");
  // }
  // return rootDir;
};
