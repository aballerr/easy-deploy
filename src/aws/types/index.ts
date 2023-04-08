interface AwsSdkErrorMetadata {
  httpStatusCode: number;
  requestId: string;
  extendedRequestId: string;
  cfId: undefined;
  attempts: number;
  totalRetryDelay: number;
}

export interface AwsSdkError {
  name: string;
  $fault: string;
  $metadata: AwsSdkErrorMetadata;
  Code: string;
  RequestId: string;
  HostId: string;
  message: string;
}
