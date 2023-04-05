#!/usr/bin/env node
import AWS from "aws-sdk";
import path from "path";
import fs from "fs";

const cloudfront = new AWS.CloudFront({});

export function invalidate() {
  cloudfront.createInvalidation();
}
