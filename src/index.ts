import AWS from "aws-sdk";
import path from "path";
import fs from "fs";

const s3 = new AWS.S3({});

const BUCKET_NAME = "mybucketasdfadzz123123";

var websiteParams = {
  Bucket: "mybucketasdfadzz123123" /* required */,
  WebsiteConfiguration: {
    /* required */
    ErrorDocument: {
      Key: "index.html" /* required */,
    },
    IndexDocument: {
      Suffix: "index.html" /* required */,
    },
  },
};

const policy = {
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

const bucketPolicyParams = {
  Bucket: "mybucketasdfadzz123123",
  Policy: JSON.stringify(policy),
};

async function main() {
  await s3
    .deleteBucket({ Bucket: BUCKET_NAME })
    .promise()
    .then((data) => {
      console.log(data);
      console.log("success");
    })
    .catch((err) => {
      console.log(err);
      console.log("error failed");
    });

  // creating bucket
  await s3
    .createBucket({ Bucket: BUCKET_NAME })
    .promise()
    .then((data) => {
      console.log(data);
      console.log("success");
    })
    .catch((err) => {
      console.log(err);
    });

  // setting up the website
  await s3
    .putBucketWebsite(websiteParams)
    .promise()
    .then((data) => {
      console.log(data);
      console.log("success");
    })
    .catch((err) => {
      console.log(err);
      console.log("error failed");
    });

  await s3
    .putBucketPolicy(bucketPolicyParams)
    .promise()
    .then((data) => {
      console.log(data);
      console.log("success");
    })
    .catch((err) => {
      console.log(err);
      console.log("error failed");
    });

  uploadFolder("sample-react-build", "");
}

main();

async function uploadFiles(filepath: string, key: string) {
  const uploadParams = { Bucket: BUCKET_NAME, Key: "", Body: "" };
  // const file = "./build/index.js";

  const fileStream = fs.createReadStream(filepath);

  // @ts-ignore
  uploadParams.Body = fileStream;
  uploadParams.Key = key;
  // console.log("key");
  // console.log(key);
  // console.log("end");

  // @ts-ignore
  return s3
    .upload(uploadParams)
    .promise()
    .then((data) => {
      // console.log(data);
      // console.log("success");
    })
    .catch((err) => {
      console.log(err);
      console.log("failure");
    });

  // s3.upload(uploadParams, function (err, data) {
  //   if (err) {
  //     console.log("Error", err);
  //   }
  //   if (data) {
  //     console.log("Upload Success", data.Location);
  //   }
  // });
}

async function uploadFolder(folderName: string, keyBase: string) {
  const directoryPath = path.join(__dirname, folderName);
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(async function (file) {
      // Do whatever you want to do with the file
      if (fs.lstatSync(path.join(directoryPath, file)).isFile()) {
        await uploadFiles(path.join(directoryPath, file), keyBase + file);
      } else {
        await uploadFolder(`${folderName}/${file}`, `${keyBase}${file}/`);
        // console.log(`${folderName}/${file}`);
      }
    });
  });

  return Promise.resolve();
}

// random
// s3.putObject({});
// uploadFiles();
// const directoryPath = path.join(__dirname, "sample-react-build/static");
// fs.readdir(directoryPath, function (err, files) {
//   //handling error
//   if (err) {
//     return console.log("Unable to scan directory: " + err);
//   }
//   //listing all files using forEach
//   files.forEach(async function (file) {
//     // Do whatever you want to do with the file
//     if (fs.lstatSync(path.join(directoryPath, file)).isFile()) {
//       await uploadFiles(path.join(directoryPath, file));
//     }
//   });
// });
// console.log(directoryPath);
// uploadFolder("sample-react-build", "");
