import finder from "find-package-json";

export const findRootDir = (): String => {
  const result = finder(__dirname);
  const baseDirectory = result.next().value?.__path || "";
  const rootPath = baseDirectory.replace("/package.json", "");

  console.log(rootPath);

  return rootPath;
};
