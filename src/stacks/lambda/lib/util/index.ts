import * as archiver from "archiver";
import * as path from "path";
import * as fs from "fs-extra";
import * as esbuild from "esbuild";
import * as os from "os";
import * as spawn from "cross-spawn";
import { dirname } from "path";

async function compressFolderToZip({
  sourceDirectory,
  outputDirectory,
}: {
  readonly sourceDirectory: string;
  readonly outputDirectory: string;
}): Promise<string> {
  if (!fs.existsSync(sourceDirectory)) {
    throw new Error(`Directory ${sourceDirectory} does not exist`);
  }

  if (fs.readdirSync(sourceDirectory).length === 0) {
    throw new Error("Directory is empty");
  }

  const outPutDirectory = path.resolve(outputDirectory);
  const outputFilePath = path.join(outPutDirectory, "output.zip");
  fs.mkdirpSync(outPutDirectory);

  const output = fs.createWriteStream(outputFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((res, rej) => {
    output.on("close", function () {
      console.log("Folder compressed successfully.");
      res(outputFilePath);
    });

    archive.on("error", function (err) {
      const errorMessage = (err as Error).message;
      rej(errorMessage);
    });

    archive.pipe(output);
    archive.directory(sourceDirectory, false);
    archive.finalize();
  });
}
