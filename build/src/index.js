"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var s3 = new aws_sdk_1.default.S3({});
var BUCKET_NAME = "mybucketasdfadzz123123";
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
var policy = {
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
var bucketPolicyParams = {
    Bucket: "mybucketasdfadzz123123",
    Policy: JSON.stringify(policy),
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, s3
                        .deleteBucket({ Bucket: BUCKET_NAME })
                        .promise()
                        .then(function (data) {
                        console.log(data);
                        console.log("success");
                    })
                        .catch(function (err) {
                        console.log(err);
                        console.log("error failed");
                    })];
                case 1:
                    _a.sent();
                    // creating bucket
                    return [4 /*yield*/, s3
                            .createBucket({ Bucket: BUCKET_NAME })
                            .promise()
                            .then(function (data) {
                            console.log(data);
                            console.log("success");
                        })
                            .catch(function (err) {
                            console.log(err);
                        })];
                case 2:
                    // creating bucket
                    _a.sent();
                    // setting up the website
                    return [4 /*yield*/, s3
                            .putBucketWebsite(websiteParams)
                            .promise()
                            .then(function (data) {
                            console.log(data);
                            console.log("success");
                        })
                            .catch(function (err) {
                            console.log(err);
                            console.log("error failed");
                        })];
                case 3:
                    // setting up the website
                    _a.sent();
                    return [4 /*yield*/, s3
                            .putBucketPolicy(bucketPolicyParams)
                            .promise()
                            .then(function (data) {
                            console.log(data);
                            console.log("success");
                        })
                            .catch(function (err) {
                            console.log(err);
                            console.log("error failed");
                        })];
                case 4:
                    _a.sent();
                    uploadFolder("sample-react-build", "");
                    return [2 /*return*/];
            }
        });
    });
}
main();
function uploadFiles(filepath, key) {
    return __awaiter(this, void 0, void 0, function () {
        var uploadParams, fileStream;
        return __generator(this, function (_a) {
            uploadParams = { Bucket: BUCKET_NAME, Key: "", Body: "" };
            fileStream = fs_1.default.createReadStream(filepath);
            // @ts-ignore
            uploadParams.Body = fileStream;
            uploadParams.Key = key;
            // console.log("key");
            // console.log(key);
            // console.log("end");
            // @ts-ignore
            return [2 /*return*/, s3
                    .upload(uploadParams)
                    .promise()
                    .then(function (data) {
                    // console.log(data);
                    // console.log("success");
                })
                    .catch(function (err) {
                    console.log(err);
                    console.log("failure");
                })];
        });
    });
}
function uploadFolder(folderName, keyBase) {
    return __awaiter(this, void 0, void 0, function () {
        var directoryPath;
        return __generator(this, function (_a) {
            directoryPath = path_1.default.join(__dirname, folderName);
            fs_1.default.readdir(directoryPath, function (err, files) {
                //handling error
                if (err) {
                    return console.log("Unable to scan directory: " + err);
                }
                //listing all files using forEach
                files.forEach(function (file) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!fs_1.default.lstatSync(path_1.default.join(directoryPath, file)).isFile()) return [3 /*break*/, 2];
                                    return [4 /*yield*/, uploadFiles(path_1.default.join(directoryPath, file), keyBase + file)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, uploadFolder("".concat(folderName, "/").concat(file), "".concat(keyBase).concat(file, "/"))];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                });
            });
            return [2 /*return*/, Promise.resolve()];
        });
    });
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
