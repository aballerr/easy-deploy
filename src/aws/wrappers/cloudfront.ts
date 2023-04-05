import {
  CloudFrontClient,
  CreateInvalidationCommand,
  CreateDistributionCommand,
  GetDistributionCommand,
} from "@aws-sdk/client-cloudfront";

import {
  cloudfrontInvalidationParams,
  cloudfrontDistributionParams,
} from "../params";

const client = new CloudFrontClient({});

export async function createCloudFrontDistribution() {
  const createInvalidationCommand = new CreateDistributionCommand(
    cloudfrontDistributionParams
  );

  return client.send(createInvalidationCommand);
}

export async function getDistributionConfig(distributionId: string) {
  const getDistributionConfigCommand = new GetDistributionCommand({
    Id: distributionId,
  });

  return client.send(getDistributionConfigCommand);
}

export async function createCloudFrontInvalidation(distributionId: string) {
  cloudfrontInvalidationParams.DistributionId = distributionId;
  const createInvalidationCommand = new CreateInvalidationCommand(
    cloudfrontInvalidationParams
  );

  return client.send(createInvalidationCommand);
}
