#!/usr/bin/env node
import AWS from "aws-sdk";
import path from "path";
import fs from "fs";
import {
  createBucket,
  configureS3Bucket,
  deleteBucket,
  uploadFolderTos3Bucket,
} from "./s3-deploy";

import { invalidate } from "./cloudfront";

const s3 = new AWS.S3({});

const BUCKET_NAME = "mybucketasdfadzz123123";

async function main() {
  await deleteBucket(BUCKET_NAME);

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

  await configureS3Bucket(BUCKET_NAME);

  await uploadFolderTos3Bucket("sample-react-build", "");

  await invalidate();
}

main();
