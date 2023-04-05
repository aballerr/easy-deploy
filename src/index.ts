#!/usr/bin/env node
import AWS from "aws-sdk";
import path from "path";
import fs from "fs";
import {
  createBucket,
  deleteBucket,
  uploadFolderTos3Bucket,
} from "./s3-deploy";

const s3 = new AWS.S3({});

const BUCKET_NAME = "mybucketasdfadzz123123";

async function main() {
  await deleteBucket(BUCKET_NAME);

  // creating bucket
  // await s3
  //   .createBucket({ Bucket: BUCKET_NAME })
  //   .promise()
  //   .then((data) => {
  //     console.log(data);
  //     console.log("success");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // setting up the website
  // await s3
  //   .putBucketWebsite(websiteParams)
  //   .promise()
  //   .then((data) => {
  //     console.log(data);
  //     console.log("success");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     console.log("error failed");
  //   });

  // await s3
  //   .putBucketPolicy(bucketPolicyParams)
  //   .promise()
  //   .then((data) => {
  //     console.log(data);
  //     console.log("success");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     console.log("error failed");
  //   });

  uploadFolderTos3Bucket("sample-react-build", "");
}

main();
