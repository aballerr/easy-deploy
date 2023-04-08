import path from "path";
import fs from "fs";
import finder from "find-package-json";

export const findRootDir = () => {
  let currentDir = process.cwd();

  console.log(currentDir);

  console.log(__dirname);

  console.log("package.json location");

  const result = finder(__dirname);

  console.log(result.next().value?.__path);

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
