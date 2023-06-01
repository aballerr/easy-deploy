import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as fs from "fs";
import { Construct } from "constructs";

import { createArchive } from "../../../../utils";

export class NextJsAssetsDeployment extends Construct {
  public deployments: BucketDeployment[];
  private bucket: s3.Bucket;

  constructor(
    scope: Construct,
    id: string,
    {
      bucket,
      basePath,
    }: {
      bucket: s3.Bucket;
      basePath: string;
    }
  ) {
    super(scope, id);
    this.bucket = bucket;

    this.uploadS3Assets(basePath);
  }

  private uploadS3Assets(basePath: string) {
    const sourceDirectory = `${basePath}/assets`;
    const outputDirectory = `${basePath}/temp-assets-output`;

    const zipPath = createArchive({
      sourceDirectory,
      outputDirectory,
    });

    const bucketDeployment = new BucketDeployment(this, "DeployFiles", {
      destinationBucket: this.bucket,
      sources: [Source.asset(zipPath)],
    });

    fs.rmSync(outputDirectory, { recursive: true, force: true });

    this.deployments = [bucketDeployment];
    this.bucket = this.bucket;
  }
}
