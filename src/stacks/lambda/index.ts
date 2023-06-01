import cdk = require("aws-cdk-lib");
import * as s3 from "aws-cdk-lib/aws-s3";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  NextJsAssetsDeployment,
  NextJsServerDeployment,
  ImageServerFunction,
  CloudFrontDistribution,
} from "./lib/constructs";
import { buildNextJSAssets, createArchive } from "../../utils";

interface StackDeploymentProps extends cdk.StackProps {
  nextJsSourceDirectory: string;
}

export class NextJsCdkStack extends cdk.Stack {
  private bucket: s3.Bucket;
  private basePath: string;
  private baseOpenNextPath: string;

  constructor(scope: Construct, id: string, props: StackDeploymentProps) {
    super(scope, id, props);
    this.basePath = `${process.cwd()}/${props.nextJsSourceDirectory}`;
    this.baseOpenNextPath = `${this.basePath}/.open-next`;

    buildNextJSAssets({ sourceDirectory: this.basePath });

    this.bucket = new s3.Bucket(this, "nextjs-assets-bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const assetDeployment = new NextJsAssetsDeployment(
      this,
      "NextJsAssetsDeployment",
      {
        bucket: this.bucket,
        basePath: this.baseOpenNextPath,
      }
    );

    const serverDeployment = new NextJsServerDeployment(
      this,
      "ServerDeployment",
      {
        basePath: this.baseOpenNextPath,
      }
    );

    const imageDeployment = new ImageServerFunction(
      this,
      "ImageServerFunction",
      {
        bucket: this.bucket,
        basePath: this.baseOpenNextPath,
      }
    );

    serverDeployment.node.addDependency(...assetDeployment.deployments);

    const cloudFrontDistribution = new CloudFrontDistribution(
      this,
      "CloudFrontDistribution",
      {
        staticAssetsBucket: this.bucket,
        serverFunction: serverDeployment.lambdaFunction,
        imageOptFunction: imageDeployment.lambdaFunction,
        basePath: this.baseOpenNextPath,
      }
    );
  }
}
