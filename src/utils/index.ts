import * as finder from "find-package-json";
import * as path from "path";
import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import * as os from "os";
import * as spawn from "cross-spawn";
import { dirname } from "path";

export const findRootDir = (): string => {
  const result = finder(process.cwd());
  const baseDirectory = result.next().value?.__path || "";
  const rootPath = baseDirectory.replace("/package.json", "");

  return rootPath;
};

// zip up a directory and return path to zip file
export function createArchive({
  sourceDirectory,
  outputDirectory,
}: {
  readonly sourceDirectory: string;
  readonly outputDirectory: string;
}): string {
  const zipFileName = "output.zip";
  const nextjsAppPath = `${process.cwd()}/${sourceDirectory}`;

  console.log(nextjsAppPath);
  console.log(process.cwd());
  // if directory is empty, can skip
  if (!fs.existsSync(sourceDirectory)) {
    throw new Error(`Directory ${sourceDirectory} does not exist`);
  }

  if (fs.readdirSync(sourceDirectory).length === 0) {
    throw new Error("Directory is empty");
  }

  const outPutDirectory = path.resolve(outputDirectory);
  const outputFilePath = path.join(outPutDirectory, zipFileName);
  fs.mkdirpSync(outPutDirectory);

  // delete existing zip file
  if (fs.existsSync(outputFilePath)) {
    fs.unlinkSync(outputFilePath);
  }

  // run script to create zipfile, preserving symlinks for node_modules (e.g. pnpm structure)
  const result = spawn.sync(
    "bash", // getting ENOENT when specifying 'node' here for some reason
    [
      "-xc",
      [`cd '${sourceDirectory}'`, `zip -ryq${9} '${outputFilePath}' .`].join(
        "&&"
      ),
    ],
    { stdio: "inherit" }
  );
  if (result.status !== 0) {
    throw new Error(
      `There was a problem generating the package for ${zipFileName} with ${sourceDirectory}: ${result.error}`
    );
  }
  // check output
  if (!fs.existsSync(outputFilePath)) {
    throw new Error(
      `There was a problem generating the archive for ${sourceDirectory}; the archive is missing in ${outputFilePath}.`
    );
  }

  return outputFilePath;
}

interface BundleFunctionArgs {
  inputPath: string;
  outputFilename?: string;
  outputPath?: string;
  bundleOptions: esbuild.BuildOptions;
}

/**
 * Compile a function handler with esbuild.
 * @returns bundle directory path
 */
export function bundleFunction({
  inputPath,
  outputPath,
  outputFilename,
  bundleOptions,
}: BundleFunctionArgs) {
  if (!outputPath) {
    if (!outputFilename)
      outputFilename =
        bundleOptions.format === "esm" ? "index.mjs" : "index.js";
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nextjs-bundling-"));
    outputPath = path.join(tempDir, outputFilename);
  }

  const esbuildResult = esbuild.buildSync({
    ...bundleOptions,
    entryPoints: [inputPath],
    outfile: outputPath,
  });
  if (esbuildResult.errors.length > 0) {
    esbuildResult.errors.forEach((error) => console.error(error));
    throw new Error("There was a problem bundling the function.");
  }

  // console.debug('Bundled ', inputPath, 'to', outputPath);

  return dirname(outputPath);
}

export function buildNextJSAssets({
  sourceDirectory = ".",
}: {
  readonly sourceDirectory: string;
}) {
  console.log("source");
  console.log(sourceDirectory);
  console.log("end");

  const result = spawn.sync(
    "bash", // getting ENOENT when specifying 'node' here for some reason
    ["-xc", [`cd '${sourceDirectory}'`, `npx open-next build`].join("&&")],
    { stdio: "inherit" }
  );
}
