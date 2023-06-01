#!/usr/bin/env node
import {
  configureS3Bucket,
  createOrInvalidateCloudfrontDistribution,
  createBucket,
  deleteBucket,
  uploadFolderToS3Bucket,
} from ".";

import { findRootDir } from "../../utils";

export async function main(BUCKET_NAME: string, dirName?: string) {
  const rootDir = findRootDir();

  await createBucket(BUCKET_NAME);
  await configureS3Bucket(BUCKET_NAME);
  await uploadFolderToS3Bucket(rootDir, BUCKET_NAME, dirName ?? "build", "");
  await createOrInvalidateCloudfrontDistribution(BUCKET_NAME);
}
