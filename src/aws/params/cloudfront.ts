export const cloudfrontInvalidationParams = {
  DistributionId: "",
  InvalidationBatch: {
    CallerReference: String(new Date().getTime()),
    Paths: {
      Quantity: 1,
      Items: ["/*"],
    },
  },
};

export const cloudfrontDistributionParams = {
  DistributionConfig: {
    CallerReference: String(new Date()),
    Aliases: { Quantity: 0 },
    DefaultRootObject: "index.html",
    Origins: {
      Quantity: 1,
      Items: [
        {
          Id: "mybucketasdfadzz123123.s3-website-us-east-1.amazonaws.com",
          DomainName:
            "mybucketasdfadzz123123.s3-website-us-east-1.amazonaws.com",
          OriginPath: "",
          CustomHeaders: { Quantity: 0 },
          CustomOriginConfig: {
            HTTPPort: 80,
            HTTPSPort: 443,
            OriginProtocolPolicy: "http-only",
            OriginSslProtocols: { Quantity: 1, Items: ["TLSv1.2"] },
            OriginReadTimeout: 30,
            OriginKeepaliveTimeout: 5,
          },
          ConnectionAttempts: 3,
          ConnectionTimeout: 10,
          OriginShield: { Enabled: false },
          OriginAccessControlId: "",
        },
      ],
    },
    OriginGroups: { Quantity: 0 },
    DefaultCacheBehavior: {
      TargetOriginId:
        "mybucketasdfadzz123123.s3-website-us-east-1.amazonaws.com",
      TrustedSigners: { Enabled: false, Quantity: 0 },
      TrustedKeyGroups: { Enabled: false, Quantity: 0 },
      ViewerProtocolPolicy: "redirect-to-https",
      AllowedMethods: {
        Quantity: 2,
        Items: ["HEAD", "GET"],
        CachedMethods: { Quantity: 2, Items: ["HEAD", "GET"] },
      },
      SmoothStreaming: false,
      Compress: true,
      LambdaFunctionAssociations: { Quantity: 0 },
      FunctionAssociations: { Quantity: 0 },
      FieldLevelEncryptionId: "",
      CachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
    },
    CacheBehaviors: { Quantity: 0 },
    CustomErrorResponses: { Quantity: 0 },
    Comment: "",
    Logging: { Enabled: false, IncludeCookies: false, Bucket: "", Prefix: "" },
    PriceClass: "PriceClass_100",
    Enabled: true,
    ViewerCertificate: {
      CloudFrontDefaultCertificate: true,
      SSLSupportMethod: "vip",
      MinimumProtocolVersion: "TLSv1",
      CertificateSource: "cloudfront",
    },
    Restrictions: { GeoRestriction: { RestrictionType: "none", Quantity: 0 } },
    WebACLId: "",
    HttpVersion: "http2",
    IsIPV6Enabled: true,
    ContinuousDeploymentPolicyId: "",
    Staging: false,
  },
};
