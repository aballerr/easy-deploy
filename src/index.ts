#!/usr/bin/env node
import {
  configureS3Bucket,
  createCloudFrontDistribution,
  createCloudFrontInvalidation,
  createBucket,
  deleteBucket,
  getDistributionConfig,
  uploadFolderToS3Bucket,
} from "./aws/wrappers";

const BUCKET_NAME = "mybucketasdfadzz123123";

async function main() {
  // await deleteBucket(BUCKET_NAME);
  // await createBucket(BUCKET_NAME);
  // await configureS3Bucket(BUCKET_NAME);
  // await uploadFolderToS3Bucket(
  //   __dirname,
  //   BUCKET_NAME,
  //   "sample-react-build",
  //   ""
  // );
  // await createCloudFrontInvalidation("EODP9VY2T4F47");
  // const result = await getDistributionConfig("EODP9VY2T4F47");
  // console.log(JSON.stringify(result.Distribution?.DistributionConfig));
  // console.log(directoryPath);

  await createCloudFrontDistribution();
  // console.log(String(new Date()));
}

main();
