import finder from "find-package-json";

export const findRootDir = (): String => {
  const result = finder(process.cwd());
  const baseDirectory = result.next().value?.__path || "";
  const rootPath = baseDirectory.replace("/package.json", "");

  console.log(rootPath);

  return rootPath;
};
