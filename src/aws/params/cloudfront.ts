export const cloudfrontInvalidationParams = {
  DistributionId: "EODP9VY2T4F47",
  InvalidationBatch: {
    CallerReference: String(new Date().getTime()),
    Paths: {
      Quantity: 1,
      Items: ["/*"],
    },
  },
};
