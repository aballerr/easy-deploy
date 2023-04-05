#!/usr/bin/env node
import {
  createBucket,
  configureS3Bucket,
  deleteBucket,
  uploadFolderTos3Bucket,
} from "./s3-deploy";

import { createCloudFrontInvalidation } from "./aws/wrappers/cloudfront";

const BUCKET_NAME = "mybucketasdfadzz123123";

async function main() {
  await deleteBucket(BUCKET_NAME);

  await createBucket(BUCKET_NAME);

  await configureS3Bucket(BUCKET_NAME);
  await uploadFolderTos3Bucket(BUCKET_NAME, "sample-react-build", "");
  await createCloudFrontInvalidation("EODP9VY2T4F47");
}

main();
