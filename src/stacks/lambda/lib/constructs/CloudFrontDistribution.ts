import { BucketDeployment } from "aws-cdk-lib/aws-s3-deployment";
import { Duration, Fn, RemovalPolicy } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";

import { ResponseHeadersPolicy } from "aws-cdk-lib/aws-cloudfront";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { dirname } from "path";

import { bundleFunction } from "../../../../utils";

const DEFAULT_STATIC_MAX_AGE = Duration.days(30).toSeconds();

interface NextjsDistributionProps {
  staticAssetsBucket: s3.Bucket;
  serverFunction: lambda.Function;
  imageOptFunction: lambda.Function;
  basePath: string;
}

export class CloudFrontDistribution extends Construct {
  public deployments: BucketDeployment[];
  private props: NextjsDistributionProps;

  /**
   * The default CloudFront cache policy properties for static pages.
   */
  public static staticCachePolicyProps: cloudfront.CachePolicyProps = {
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
    headerBehavior: cloudfront.CacheHeaderBehavior.none(),
    cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    defaultTtl: Duration.days(30),
    maxTtl: Duration.days(60),
    minTtl: Duration.days(30),
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,
    comment: "Nextjs Static Default Cache Policy",
  };

  /**
   * The default CloudFront cache policy properties for images.
   */
  public static imageCachePolicyProps: cloudfront.CachePolicyProps = {
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    headerBehavior: cloudfront.CacheHeaderBehavior.allowList("Accept"),
    cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    defaultTtl: Duration.days(1),
    maxTtl: Duration.days(365),
    minTtl: Duration.days(0),
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,
    comment: "Nextjs Image Default Cache Policy",
  };

  /**
   * The default CloudFront cache policy properties for the Lambda server handler.
   */
  public static lambdaCachePolicyProps: cloudfront.CachePolicyProps = {
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    headerBehavior: cloudfront.CacheHeaderBehavior.none(),
    cookieBehavior: cloudfront.CacheCookieBehavior.all(),
    defaultTtl: Duration.seconds(0),
    maxTtl: Duration.days(365),
    minTtl: Duration.seconds(0),
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,
    comment: "Nextjs Lambda Default Cache Policy",
  };

  /**
   * The default CloudFront lambda origin request policy.
   */
  public static lambdaOriginRequestPolicyProps: cloudfront.OriginRequestPolicyProps =
    {
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(), // can't include host
      comment: "Nextjs Lambda Origin Request Policy",
    };

  public static fallbackOriginRequestPolicyProps: cloudfront.OriginRequestPolicyProps =
    {
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(), // pretty much disables caching - maybe can be changed
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(),
      comment: "Nextjs Fallback Origin Request Policy",
    };

  public static imageOptimizationOriginRequestPolicyProps: cloudfront.OriginRequestPolicyProps =
    {
      queryStringBehavior:
        cloudfront.OriginRequestQueryStringBehavior.allowList("q", "w", "url"),
      headerBehavior:
        cloudfront.OriginRequestHeaderBehavior.allowList("accept"),
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
      comment: "Nextjs Image Optimization Origin Request Policy",
    };

  constructor(scope: Construct, id: string, props: NextjsDistributionProps) {
    super(scope, id);
    this.props = props;

    this.createCloudFrontDistribution();
  }

  private createCloudFrontStaticCachePolicy() {
    return new cloudfront.CachePolicy(this, "static-cache-policy", {
      ...CloudFrontDistribution.staticCachePolicyProps,
    });
  }

  private createCloudFrontImageCachePolicy() {
    return new cloudfront.CachePolicy(this, "image-cache-policy", {
      ...CloudFrontDistribution.imageCachePolicyProps,
    });
  }
  private createLambdaOriginRequestPolicy(): cloudfront.OriginRequestPolicy {
    return new cloudfront.OriginRequestPolicy(
      this,
      "LambdaOriginPolicy",
      CloudFrontDistribution.lambdaOriginRequestPolicyProps
    );
  }
  private createImageOptimizationOriginRequestPolicy(): cloudfront.OriginRequestPolicy {
    return new cloudfront.OriginRequestPolicy(this, "image-opt-origin-policy", {
      ...CloudFrontDistribution.imageOptimizationOriginRequestPolicyProps,
    });
  }

  private createCloudFrontLambdaCachePolicy(): cloudfront.CachePolicy {
    return new cloudfront.CachePolicy(this, "LambdaCache", {
      ...CloudFrontDistribution.lambdaCachePolicyProps,
    });
  }

  private createFallbackOriginRequestPolicy(): cloudfront.OriginRequestPolicy {
    return new cloudfront.OriginRequestPolicy(
      this,
      "FallbackOriginRequestPolicy",
      { ...CloudFrontDistribution.fallbackOriginRequestPolicyProps }
    );
  }

  /**
   * Create an edge function to handle requests to the lambda server handler origin.
   * It overrides the host header in the request to be the lambda URL's host.
   * It's needed because we forward all headers to the origin, but the origin is itself an
   *  HTTP server so it needs the host header to be the address of the lambda and not
   *  the distribution.
   *
   */
  private buildLambdaOriginRequestEdgeFunction() {
    // bundle the edge function
    const inputPath = path.join(
      __dirname,
      "..",
      "assets",
      "lambda@edge",
      "LambdaOriginRequest"
    );

    console.log(inputPath);

    const outputPath = path.join(
      this.props.basePath,
      "nextjs-cdk-build",
      "lambda@edge",
      "LambdaOriginRequest.js"
    );
    bundleFunction({
      inputPath,
      outputPath,
      bundleOptions: {
        bundle: true,
        external: ["aws-sdk", "url"],
        minify: true,
        target: "node16",
        platform: "node",
      },
    });

    const fn = new cloudfront.experimental.EdgeFunction(
      this,
      "DefaultOriginRequestEdgeFn",
      {
        runtime: Runtime.NODEJS_16_X,
        // role,
        handler: "LambdaOriginRequest.handler",
        code: lambda.Code.fromAsset(dirname(outputPath)),
        currentVersionOptions: {
          removalPolicy: RemovalPolicy.DESTROY, // destroy old versions
          retryAttempts: 1, // async retry attempts
        },
        stackId: `Nextjs-default-EdgeFn-` + this.node.addr.substring(0, 5),
      }
    );
    fn.currentVersion.grantInvoke(
      new ServicePrincipal("edgelambda.amazonaws.com")
    );
    fn.currentVersion.grantInvoke(new ServicePrincipal("lambda.amazonaws.com"));

    return fn;
  }

  private createCloudFrontDistribution() {
    const s3Origin = new origins.S3Origin(this.props.staticAssetsBucket);

    const viewerProtocolPolicy =
      cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS;

    // cache policies
    const staticCachePolicy = this.createCloudFrontStaticCachePolicy();
    const imageCachePolicy = this.createCloudFrontImageCachePolicy();
    const lambdaOriginRequestPolicy = this.createLambdaOriginRequestPolicy();

    // main server function origin (lambda URL HTTP origin)
    const fnUrl = this.props.serverFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    const serverFunctionOrigin = new origins.HttpOrigin(
      Fn.parseDomainName(fnUrl.url),
      {
        customHeaders: {
          // provide config to edge lambda function
          "x-origin-url": fnUrl.url,
        },
      }
    );

    // Image Optimization
    const imageOptFnUrl = this.props.imageOptFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    const imageOptFunctionOrigin = new origins.HttpOrigin(
      Fn.parseDomainName(imageOptFnUrl.url)
    );
    const imageOptORP = this.createImageOptimizationOriginRequestPolicy();

    // lambda behavior edge function
    const lambdaOriginRequestEdgeFn =
      this.buildLambdaOriginRequestEdgeFunction();

    const lambdaOriginRequestEdgeFnVersion = lambda.Version.fromVersionArn(
      this,
      "Version",
      lambdaOriginRequestEdgeFn.currentVersion.functionArn
    );
    const lambdaOriginEdgeFns: cloudfront.EdgeLambda[] = [
      {
        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        functionVersion: lambdaOriginRequestEdgeFnVersion,
        includeBody: false,
      },
    ];

    // default handler for requests that don't match any other path:
    //   - try lambda handler first (/some-page, etc...)
    //   - if 403, fall back to S3
    //   - if 404, fall back to lambda handler
    //   - if 503, fall back to lambda handler
    const fallbackOriginGroup = new origins.OriginGroup({
      primaryOrigin: serverFunctionOrigin,
      fallbackOrigin: s3Origin,
      fallbackStatusCodes: [403, 404, 503],
    });

    const lambdaCachePolicy = this.createCloudFrontLambdaCachePolicy();

    // requests for static objects
    const defaultStaticMaxAge = DEFAULT_STATIC_MAX_AGE;
    const staticResponseHeadersPolicy = new ResponseHeadersPolicy(
      this,
      "StaticResponseHeadersPolicy",
      {
        // add default header for static assets
        customHeadersBehavior: {
          customHeaders: [
            {
              header: "cache-control",
              override: false,
              // by default tell browser to cache static files for this long
              // this is separate from the origin cache policy
              value: `public,max-age=${defaultStaticMaxAge},immutable`,
            },
          ],
        },
      }
    );

    const staticBehavior: cloudfront.BehaviorOptions = {
      viewerProtocolPolicy,
      origin: s3Origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      compress: true,
      cachePolicy: staticCachePolicy,
      responseHeadersPolicy: staticResponseHeadersPolicy,
    };

    // requests going to lambda (api, etc)
    const lambdaBehavior: cloudfront.BehaviorOptions = {
      viewerProtocolPolicy,
      origin: serverFunctionOrigin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      // cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS, // this should be configurable
      originRequestPolicy: lambdaOriginRequestPolicy,
      compress: true,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      edgeLambdas: lambdaOriginEdgeFns,
    };

    // requests to fallback origin group (default behavior)
    // used for S3 and lambda. would prefer to forward all headers to lambda but need to strip out host
    // TODO: try to do this with headers whitelist or edge lambda
    const fallbackOriginRequestPolicy =
      this.createFallbackOriginRequestPolicy();

    // if we don't have a static file called index.html then we should
    // redirect to the lambda handler
    const hasIndexHtml = false;

    return new cloudfront.Distribution(this, "Distribution", {
      // defaultRootObject: "index.html",
      defaultRootObject: "",

      // Override props.
      // ...cfDistributionProps,

      // these values can NOT be overwritten by cfDistributionProps
      // domainNames,
      // certificate: this.certificate,
      defaultBehavior: {
        origin: fallbackOriginGroup, // try S3 first, then lambda
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,

        // what goes here? static or lambda?
        cachePolicy: lambdaCachePolicy,
        originRequestPolicy: fallbackOriginRequestPolicy,

        edgeLambdas: lambdaOriginEdgeFns,
      },

      additionalBehaviors: {
        // is index.html static or dynamic?
        ...(hasIndexHtml ? {} : { "/": lambdaBehavior }),

        // known dynamic routes
        "api/*": lambdaBehavior,
        "_next/data/*": lambdaBehavior,

        // dynamic images go to lambda
        "_next/image*": {
          viewerProtocolPolicy,
          origin: imageOptFunctionOrigin,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: imageCachePolicy,
          originRequestPolicy: imageOptORP,
        },

        // known static routes
        // it would be nice to create routes for all the static files we know of
        // but we run into the limit of CacheBehaviors per distribution
        "_next/*": staticBehavior,
      },
    });
  }
}
