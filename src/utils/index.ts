import finder from "find-package-json";

export const findRootDir = (): string => {
  const result = finder(process.cwd());
  const baseDirectory = result.next().value?.__path || "";
  const rootPath = baseDirectory.replace("/package.json", "");

  return rootPath;
};
