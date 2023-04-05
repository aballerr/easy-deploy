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
