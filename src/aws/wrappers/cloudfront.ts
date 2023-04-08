import {
  CloudFrontClient,
  CreateInvalidationCommand,
  CreateDistributionCommand,
  GetDistributionCommand,
  ListDistributionsCommand,
} from "@aws-sdk/client-cloudfront";
import chalk from "chalk";

import { getBucketURL } from "./s3";

import {
  cloudfrontInvalidationParams,
  cloudfrontDistributionParams,
} from "../params";

const client = new CloudFrontClient({});

export async function createCloudFrontDistribution(bucketName: string) {
  try {
    const bucketURL = await getBucketURL(bucketName);

    const finalCloudFrontDistributionParams = {
      ...cloudfrontDistributionParams,
    };
    finalCloudFrontDistributionParams.DistributionConfig.Origins.Items[0].Id =
      bucketURL;
    finalCloudFrontDistributionParams.DistributionConfig.Origins.Items[0].DomainName =
      bucketURL;
    finalCloudFrontDistributionParams.DistributionConfig.DefaultCacheBehavior.TargetOriginId =
      bucketURL;

    const createDistributionCommand = new CreateDistributionCommand(
      finalCloudFrontDistributionParams
    );

    const distribution = await client.send(createDistributionCommand);

    console.log(chalk.green(`Successfully created cloudfront distribution:`));
    console.log(
      chalk.green(`Distribution ID: ${distribution.Distribution?.Id}`)
    );
    console.log(
      chalk.green(`Website URL: ${distribution.Distribution?.DomainName} \n`)
    );
    console.log(
      chalk.yellow(
        `NOTE: It takes a few minutes before the cloudfront url is active\n`
      )
    );

    return Promise.resolve(distribution);
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getDistributionConfig(distributionId: string) {
  try {
    const getDistributionConfigCommand = new GetDistributionCommand({
      Id: distributionId,
    });

    const distributionConfig = await client.send(getDistributionConfigCommand);

    return Promise.resolve(distributionConfig);
  } catch (err) {
    console.log("Get Distribution Config Failed");

    return Promise.reject(err);
  }
}

export async function createCloudFrontInvalidation(
  distributionId: string,
  domain?: string
) {
  try {
    cloudfrontInvalidationParams.DistributionId = distributionId;
    const createInvalidationCommand = new CreateInvalidationCommand(
      cloudfrontInvalidationParams
    );

    await client.send(createInvalidationCommand);

    console.log(chalk.green(`Invalidated cloudfront distribution`));
    console.log(chalk.green(`Website URL: ${domain} \n`));

    return Promise.resolve();
  } catch (err) {
    console.log("Create Invalidation Failed");
    return Promise.reject(err);
  }
}

export async function createOrInvalidateCloudfrontDistribution(
  bucketName: string
) {
  try {
    const allDistributions = await client.send(
      new ListDistributionsCommand({})
    );
    const bucketURL = await getBucketURL(bucketName);

    for (const distribution of allDistributions.DistributionList?.Items || []) {
      if (
        bucketURL === distribution?.DefaultCacheBehavior?.TargetOriginId &&
        distribution !== undefined &&
        distribution.Id !== undefined
      ) {
        await createCloudFrontInvalidation(
          distribution.Id,
          distribution.DomainName
        );

        return Promise.resolve();
      }
    }

    await createCloudFrontDistribution(bucketName);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}
