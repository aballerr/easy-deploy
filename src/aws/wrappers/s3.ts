import path from "path";
import fs from "fs";
import mime from "mime-types";
import { s3ACLPolicy } from "../params";
import { s3WebsiteParams } from "../params";
import {
  S3Client,
  ListObjectsCommand,
  CreateBucketCommand,
  PutBucketWebsiteCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({});

export async function deleteBucket(bucketName: string) {
  try {
    const results = await client.send(
      new ListObjectsCommand({ Bucket: bucketName })
    );

    if (results.Contents) {
      for (const file of results.Contents) {
        if (file.Key)
          await client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: file.Key })
          );
      }
    }

    await client.send(new DeleteBucketCommand({ Bucket: bucketName }));

    console.log("finished deleting s3 bucket");

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function createBucket(bucketName: string) {
  try {
    const createBucketCommand = new CreateBucketCommand({ Bucket: bucketName });
    const data = await client.send(createBucketCommand);

    console.log("Successfully created a bucket");
    return Promise.resolve();
  } catch (err) {
    console.log(err);
    console.log("failed to create bucket");
    return Promise.reject();
  }
}

// Making the s3 bucket website compatible
export async function configureS3Bucket(bucketName: string) {
  const websiteParams = {
    ...s3WebsiteParams,
    Bucket: bucketName,
  };

  try {
    const putBucketWebsiteCommand = new PutBucketWebsiteCommand(websiteParams);
    await client.send(putBucketWebsiteCommand);

    console.log("successfully configured bucket as s3 website");

    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(s3ACLPolicy),
      })
    );

    console.log("successfully configured bucket policy");

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

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

export async function uploadFolderToS3Bucket(
  baseDirectory: string,
  bucketName: string,
  folderName: string,
  keyBase: string
) {
  try {
    const directoryPath = path.join(baseDirectory, folderName);

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
          await uploadFolderToS3Bucket(
            baseDirectory,
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
