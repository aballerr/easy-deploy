export const s3ACLPolicy = {
  Version: "2008-10-17",
  Id: "PolicyForPublicWebsiteContent",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: {
        AWS: "*",
      },
      Action: "s3:GetObject",
      Resource: "arn:aws:s3:::mybucketasdfadzz123123/*",
    },
  ],
};

export const s3FileUploadParams = {
  Bucket: "",
  Key: "",
  //   Body: fs.createReadStream(""),
  ContentType: "",
};

export const s3WebsiteParams = {
  Bucket: "bucketName",
  WebsiteConfiguration: {
    ErrorDocument: {
      Key: "index.html",
    },
    IndexDocument: {
      Suffix: "index.html",
    },
  },
};
