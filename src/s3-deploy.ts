#!/usr/bin/env node
import path from "path";
import fs from "fs";
import mime from "mime-types";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({});

export async function uploadFiles(
  bucketName: string,
  filepath: string,
  key: string
) {
  try {
    const fileStream = fs.createReadStream(filepath);
    const s3FileUploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: key,
      ContentType: mime.lookup(key) || "text/html",
    };

    const upload = await client.send(new PutObjectCommand(s3FileUploadParams));

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function uploadFolderTos3Bucket(
  bucketName: string,
  folderName: string,
  keyBase: string
) {
  try {
    const directoryPath = path.join(__dirname, folderName);

    fs.readdir(directoryPath, function (err, files) {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }
      //listing all files using forEach
      files.forEach(async function (file) {
        if (fs.lstatSync(path.join(directoryPath, file)).isFile()) {
          await uploadFiles(
            bucketName,
            path.join(directoryPath, file),
            keyBase + file
          );
        } else {
          await uploadFolderTos3Bucket(
            bucketName,
            `${folderName}/${file}`,
            `${keyBase}${file}/`
          );
        }
      });
    });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}
