#!/usr/bin/env node
import {
  configureS3Bucket,
  createOrInvalidateCloudfrontDistribution,
  createBucket,
  deleteBucket,
  uploadFolderToS3Bucket,
} from "./aws/wrappers";

import { findRootDir } from "./utils";

async function main(BUCKET_NAME: string) {
  const rootDir = findRootDir();

  await createBucket(BUCKET_NAME);
  await configureS3Bucket(BUCKET_NAME);
  await uploadFolderToS3Bucket(rootDir, BUCKET_NAME, "react-build", "");
  await createOrInvalidateCloudfrontDistribution(BUCKET_NAME);
}

main("13113111zztempbucket");
