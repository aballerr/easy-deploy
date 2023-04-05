#!/usr/bin/env node
import AWS from "aws-sdk";
import path from "path";
import fs from "fs";
import mime from "mime-types";

const s3 = new AWS.S3({});

const BUCKET_NAME = "mybucketasdfadzz123123";

console.log(__dirname);

const policy = {
  Version: "2008-10-17",
  Id: "PolicyForPublicWebsiteContent",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: {
        AWS: "*",
      },
      Action: "s3:GetObject",
      Resource: "arn:aws:s3:::mybucketasdfadzz123123/*",
    },
  ],
};

const bucketPolicyParams = {
  Bucket: "mybucketasdfadzz123123",
  Policy: JSON.stringify(policy),
};

async function main() {
  // creating bucket
  await s3
    .createBucket({ Bucket: BUCKET_NAME })
    .promise()
    .then((data) => {
      console.log(data);
      console.log("success");
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function deleteBucket(bucketName: string) {
  const results = await s3.listObjects({ Bucket: bucketName }).promise();

  if (results.Contents) {
    for (const file of results.Contents) {
      if (file.Key) {
        await s3.deleteObject({ Bucket: bucketName, Key: file.Key }).promise();
      }
    }
  }
  console.log("done deleting");

  return s3.deleteBucket({ Bucket: bucketName }).promise();
}

export async function createBucket(bucketName: string) {
  try {
    const data = await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(data);
    console.log("Successfully created a bucket");
  } catch (err) {
    console.log(err);
    console.log("failed to create bucket");
  }
}

// Making the s3 bucket website compatible
export async function configureS3Bucket(bucketName: string) {
  const websiteParams = {
    Bucket: bucketName /* required */,
    WebsiteConfiguration: {
      /* required */
      ErrorDocument: {
        Key: "index.html" /* required */,
      },
      IndexDocument: {
        Suffix: "index.html" /* required */,
      },
    },
  };

  try {
    await s3.putBucketWebsite(websiteParams).promise();
    console.log("successfully configured bucket as s3 website");

    await s3.putBucketPolicy(bucketPolicyParams).promise();
    console.log("successfully configured bucket policy");

    return Promise.resolve();
  } catch (err) {}
}

// main();

async function uploadFiles(filepath: string, key: string) {
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: "",
    Body: "",
    ContentType: "",
  };
  // const file = "./build/index.js";

  const fileStream = fs.createReadStream(filepath);

  // @ts-ignore
  uploadParams.Body = fileStream;
  uploadParams.Key = key;
  uploadParams.ContentType = mime.lookup(key) || "text/html";

  // @ts-ignore
  return s3
    .upload(uploadParams)
    .promise()
    .then((data) => {
      // console.log(data);
      // console.log("success");
    })
    .catch((err) => {
      console.log(err);
      console.log("failure");
    });
}

export async function uploadFolderTos3Bucket(
  folderName: string,
  keyBase: string
) {
  const directoryPath = path.join(__dirname, folderName);

  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(async function (file) {
      // Do whatever you want to do with the file
      if (fs.lstatSync(path.join(directoryPath, file)).isFile()) {
        await uploadFiles(path.join(directoryPath, file), keyBase + file);
      } else {
        await uploadFolderTos3Bucket(
          `${folderName}/${file}`,
          `${keyBase}${file}/`
        );
        // console.log(`${folderName}/${file}`);
      }
    });
  });

  return Promise.resolve();
}
