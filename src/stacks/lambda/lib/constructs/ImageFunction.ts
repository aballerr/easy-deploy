import * as fs from "fs";
import * as s3Assets from "aws-cdk-lib/aws-s3-assets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Duration, RemovalPolicy, Token } from "aws-cdk-lib";
import { Function, FunctionOptions } from "aws-cdk-lib/aws-lambda";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";

import { createArchive } from "../../../../utils";

interface ImageServerProps {
  bucket: IBucket;
  basePath: string;
}

export class ImageServerFunction extends Construct {
  public lambdaFunction: Function;
  bucket: IBucket;

  constructor(
    scope: Construct,
    id: string,
    { bucket, basePath }: ImageServerProps
  ) {
    super(scope, id);
    this.bucket = bucket;

    this.uploadToLambda({ scope, basePath: basePath });
  }

  private uploadToLambda({
    basePath,
    scope,
  }: {
    scope: Construct;
    basePath: string;
  }) {
    const sourceDirectory = `${basePath}/image-optimization-function`;
    const outputDirectory = `${basePath}/temp-optimization-function-output`;

    const zipPath = createArchive({
      sourceDirectory,
      outputDirectory,
    });

    const s3asset = new s3Assets.Asset(scope, "ImageFn", {
      path: zipPath,
    });

    const code = lambda.Code.fromBucket(s3asset.bucket, s3asset.s3ObjectKey);

    this.lambdaFunction = new Function(scope, "ImageHandler", {
      memorySize: 1024,
      timeout: Duration.seconds(10),
      runtime: Runtime.NODEJS_18_X,
      handler: path.join("index.handler"),
      code,
      // environment,
      // ...functionOptions,
    });

    this.addPolicy();

    fs.rmSync(outputDirectory, { recursive: true, force: true });
  }

  private addPolicy(): void {
    const policyStatement = new PolicyStatement({
      actions: ["s3:GetObject"],
      resources: [this.bucket.arnForObjects("*")],
    });

    this.lambdaFunction.role?.attachInlinePolicy(
      new Policy(this, "get-image-policy", {
        statements: [policyStatement],
      })
    );
  }
}
