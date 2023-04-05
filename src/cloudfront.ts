import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

import { cloudfrontInvalidationParams } from "./aws/params";

const client = new CloudFrontClient({});

export async function createCloudFront() {
  const createInvalidationCommand = new CreateInvalidationCommand(
    cloudfrontInvalidationParams
  );

  return client.send(createInvalidationCommand);
}

export async function invalidate() {
  const createInvalidationCommand = new CreateInvalidationCommand(
    cloudfrontInvalidationParams
  );

  return client.send(createInvalidationCommand);
}
