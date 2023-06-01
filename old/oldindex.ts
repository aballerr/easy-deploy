#!/usr/bin/env node
// import {
//   configureS3Bucket,
//   createOrInvalidateCloudfrontDistribution,
//   createBucket,
//   deleteBucket,
//   uploadFolderToS3Bucket,
// } from "./aws/wrappers";

// import { findRootDir } from "./utils";

// async function main(BUCKET_NAME: string, dirName?: string) {
//   const rootDir = findRootDir();

//   await createBucket(BUCKET_NAME);
//   await configureS3Bucket(BUCKET_NAME);
//   await uploadFolderToS3Bucket(rootDir, BUCKET_NAME, dirName ?? "build", "");
//   await createOrInvalidateCloudfrontDistribution(BUCKET_NAME);
// }

// main("13113111zztempbucket", "sample-react-build");

// class Random {
//   constructor() {
//     this.dostuff();
//   }

//   protected dostuff() {
//     console.log("doing stuff");
//   }
// }

// class Random2 extends Random {
//   protected dostuff(): void {
//     console.log("yolo 420");
//   }
// }

// const r = new Random2();
