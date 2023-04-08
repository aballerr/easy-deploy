import path from "path";
import fs from "fs";
import mime from "mime-types";
import chalk from "chalk";

import { s3ACLPolicy } from "../params";
import { s3WebsiteParams } from "../params";
import { AwsSdkError } from "../types";
import {
  S3Client,
  ListObjectsCommand,
  CreateBucketCommand,
  GetBucketWebsiteCommand,
  GetBucketWebsiteOutput,
  HeadBucketCommand,
  GetBucketLocationCommand,
  PutBucketWebsiteCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({});

const bucketExistsError = new Error(
  "Bucket already exists, it's likely another user owns this bucket.  Try a different bucket name"
);

export async function bucketExists(bucketName: string): Promise<boolean> {
  try {
    // await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    await client.send(new GetBucketLocationCommand({ Bucket: bucketName }));

    return true;
  } catch (err) {
    const errorCode = err as AwsSdkError;

    if (errorCode.Code === "AccessDenied") {
      throw bucketExistsError;
    }

    return false;
  }
}

export async function deleteBucket(bucketName: string) {
  try {
    const be = await bucketExists(bucketName);
    if (!be) {
      console.log(chalk.yellow("Bucket does not exist, skipping delete..."));

      return Promise.resolve();
    }

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

    console.log(chalk.green("Finished deleting s3 bucket"));

    return Promise.resolve();
  } catch (err) {
    console.log("Delete bucket failed");

    return Promise.reject(err);
  }
}

export async function createBucket(bucketName: string) {
  try {
    const createBucketCommand = new CreateBucketCommand({ Bucket: bucketName });
    const data = await client.send(createBucketCommand);

    console.log(chalk.green(`Successfully created bucket`));

    return Promise.resolve(data);
  } catch (err) {
    console.log("Failed to create bucket");

    // @ts-ignore
    if (err.Code === "BucketAlreadyExists") {
      throw bucketExistsError;
    }

    return Promise.reject(err);
  }
}

// http://mybucketasdfadzz123123.s3-website-us-east-1.amazonaws.com
export async function getBucketURL(bucketName: string): Promise<string> {
  try {
    const location = await client.send(
      new GetBucketLocationCommand({ Bucket: bucketName })
    );

    const region = location.LocationConstraint || "us-east-1";

    const url = `${bucketName}.s3-website-${region}.amazonaws.com`;

    return Promise.resolve(url);
  } catch (err) {
    return Promise.reject(err);
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
    const result = await client.send(putBucketWebsiteCommand);

    console.log(chalk.green("Successfully configured bucket as s3 website"));

    const finalS3ACLPolicy = {
      ...s3ACLPolicy,
    };
    finalS3ACLPolicy.Statement[0].Resource = `arn:aws:s3:::${bucketName}/*`;

    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(finalS3ACLPolicy),
      })
    );

    console.log(chalk.green("Successfully configured bucket policy"));

    console.log(chalk.green("Bucket url:"));

    console.log(
      chalk.green(
        `https://s3.console.aws.amazon.com/s3/buckets/${bucketName}\n`
      )
    );

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
