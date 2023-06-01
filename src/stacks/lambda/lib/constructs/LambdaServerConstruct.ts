import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Assets from "aws-cdk-lib/aws-s3-assets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Duration, RemovalPolicy, Token } from "aws-cdk-lib";
import { Function, FunctionOptions } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as fs from "fs";

import { createArchive } from "../../../../utils";

export class NextJsServerDeployment extends Construct {
  public lambdaFunction: Function;

  constructor(
    scope: Construct,
    id: string,
    {
      basePath,
    }: {
      basePath: string;
    }
  ) {
    super(scope, id);

    this.uploadToLambda({ scope, basePath });
  }

  private uploadToLambda({
    scope,
    basePath,
  }: {
    scope: Construct;
    basePath: string;
  }) {
    const sourceDirectory = `${basePath}/server-function`;
    const outputDirectory = `${basePath}/temp-server-function-output`;

    const zipPath = createArchive({
      sourceDirectory,
      outputDirectory,
    });

    const s3asset = new s3Assets.Asset(scope, "MainFnAsset", {
      path: zipPath,
    });

    const code = lambda.Code.fromBucket(s3asset.bucket, s3asset.s3ObjectKey);

    this.lambdaFunction = new Function(scope, "ServerHandler", {
      memorySize: 1024,
      timeout: Duration.seconds(10),
      runtime: Runtime.NODEJS_18_X,
      handler: path.join("index.handler"),
      code,
      // environment,
      // ...functionOptions,
    });

    fs.rmSync(outputDirectory, { recursive: true, force: true });
  }
}
