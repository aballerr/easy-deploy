import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

import { cloudfrontInvalidationParams } from "../params";

const client = new CloudFrontClient({});

export async function createCloudFront(distributionId: string) {
  cloudfrontInvalidationParams.DistributionId = distributionId;
  const createInvalidationCommand = new CreateInvalidationCommand(
    cloudfrontInvalidationParams
  );

  return client.send(createInvalidationCommand);
}

export async function createCloudFrontInvalidation(distributionId: string) {
  cloudfrontInvalidationParams.DistributionId = distributionId;
  const createInvalidationCommand = new CreateInvalidationCommand(
    cloudfrontInvalidationParams
  );

  return client.send(createInvalidationCommand);
}
