[](#class-nodejsfunction-construct)class NodejsFunction (construct)
===================================================================

Language

Type name

 [![](/cdk/api/v2/img/dotnet32.png) .NET](/cdk/api/v2/dotnet/api/Amazon.CDK.AWS.Lambda.Nodejs.NodejsFunction.html)

`Amazon.CDK.AWS.Lambda.Nodejs.NodejsFunction`

 [![](/cdk/api/v2/img/go32.png) Go](https://pkg.go.dev/github.com/aws/aws-cdk-go/awscdk/v2/awslambdanodejs#NodejsFunction)

`github.com/aws/aws-cdk-go/awscdk/v2/awslambdanodejs#NodejsFunction`

 [![](/cdk/api/v2/img/java32.png) Java](/cdk/api/v2/java/software/amazon/awscdk/services/lambda/nodejs/NodejsFunction.html)

`software.amazon.awscdk.services.lambda.nodejs.NodejsFunction`

 [![](/cdk/api/v2/img/python32.png) Python](/cdk/api/v2/python/aws_cdk.aws_lambda_nodejs/NodejsFunction.html)

`aws_cdk.aws_lambda_nodejs.NodejsFunction`

 ![](/cdk/api/v2/img/typescript32.png) TypeScript ([source](https://github.com/aws/aws-cdk/blob/v2.237.1/packages/aws-cdk-lib/aws-lambda-nodejs/lib/function.ts#L113))

`aws-cdk-lib` » `aws_lambda_nodejs` » `NodejsFunction`

_Implements_ [`IConstruct`](constructs.IConstruct.html), [`IDependable`](constructs.IDependable.html), [`IResource`](aws-cdk-lib.IResource.html), [`IEnvironmentAware`](aws-cdk-lib.interfaces.IEnvironmentAware.html), [`IFunction`](aws-cdk-lib.aws_lambda.IFunction.html), [`IConnectable`](aws-cdk-lib.aws_ec2.IConnectable.html), [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html), [`IFunctionRef`](aws-cdk-lib.interfaces.aws_lambda.IFunctionRef.html), [`IClientVpnConnectionHandler`](aws-cdk-lib.aws_ec2.IClientVpnConnectionHandler.html)

A Node.js Lambda function bundled using esbuild.

[](#example)Example
-------------------

    new nodejs.NodejsFunction(this, 'my-handler', {
     bundling: {
         network: 'host',
         securityOpt: 'no-new-privileges',
         user: 'user:group',
         volumesFrom: ['777f7dc92da7'],
         volumes: [{ hostPath: '/host-path', containerPath: '/container-path' }],
      },
    });
    

[](#initializer)Initializer
---------------------------

    new NodejsFunction(scope: Construct, id: string, props?: NodejsFunctionProps)
    

_Parameters_

*   **scope** [`Construct`](constructs.Construct.html)
*   **id** `string`
*   **props** [`NodejsFunctionProps`](aws-cdk-lib.aws_lambda_nodejs.NodejsFunctionProps.html)

[](#construct-props)Construct Props
-----------------------------------

Name

Type

Description

adotInstrumentation?

[`AdotInstrumentationConfig`](aws-cdk-lib.aws_lambda.AdotInstrumentationConfig.html)

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

allowAllIpv6Outbound?

`boolean`

Whether to allow the Lambda to send all ipv6 network traffic.

allowAllOutbound?

`boolean`

Whether to allow the Lambda to send all network traffic (except ipv6).

allowPublicSubnet?

`boolean`

Lambda Functions in a public subnet can NOT access the internet.

applicationLogLevel?⚠️

`string`

Sets the application log level for the function.

applicationLogLevelV2?

[`ApplicationLogLevel`](aws-cdk-lib.aws_lambda.ApplicationLogLevel.html)

Sets the application log level for the function.

architecture?

[`Architecture`](aws-cdk-lib.aws_lambda.Architecture.html)

The system architectures compatible with this lambda function.

awsSdkConnectionReuse?

`boolean`

The `AWS_NODEJS_CONNECTION_REUSE_ENABLED` environment variable does not exist in the AWS SDK for JavaScript v3.

bundling?

[`BundlingOptions`](aws-cdk-lib.aws_lambda_nodejs.BundlingOptions.html)

Bundling options.

code?

[`Code`](aws-cdk-lib.aws_lambda.Code.html)

The code that will be deployed to the Lambda Handler.

codeSigningConfig?

[`ICodeSigningConfigRef`](aws-cdk-lib.interfaces.aws_lambda.ICodeSigningConfigRef.html)

Code signing config associated with this function.

currentVersionOptions?

[`VersionOptions`](aws-cdk-lib.aws_lambda.VersionOptions.html)

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

deadLetterQueue?

[`IQueue`](aws-cdk-lib.aws_sqs.IQueue.html)

The SQS queue to use if DLQ is enabled.

deadLetterQueueEnabled?

`boolean`

Enabled DLQ.

deadLetterTopic?

[`ITopic`](aws-cdk-lib.aws_sns.ITopic.html)

The SNS topic to use as a DLQ.

depsLockFilePath?

`string`

The path to the dependencies lock file (`yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `bun.lock` or `package-lock.json`).

description?

`string`

A description of the function.

durableConfig?

[`DurableConfig`](aws-cdk-lib.aws_lambda.DurableConfig.html)

The durable configuration for the function.

entry?

`string`

Path to the entry file (JavaScript or TypeScript).

environment?

`{ [string]: string }`

Key-value pairs that Lambda caches and makes available for your Lambda functions.

environmentEncryption?

[`IKeyRef`](aws-cdk-lib.interfaces.aws_kms.IKeyRef.html)

The AWS KMS key that's used to encrypt your function's environment variables.

ephemeralStorageSize?

[`Size`](aws-cdk-lib.Size.html)

The size of the function’s /tmp directory in MiB.

events?

[`IEventSource`](aws-cdk-lib.aws_lambda.IEventSource.html)`[]`

Event sources for this function.

filesystem?

[`FileSystem`](aws-cdk-lib.aws_lambda.FileSystem.html)

The filesystem configuration for the lambda function.

functionName?

`string`

A name for the function.

handler?

`string`

The name of the exported handler in the entry file.

initialPolicy?

[`PolicyStatement`](aws-cdk-lib.aws_iam.PolicyStatement.html)`[]`

Initial policy statements to add to the created Lambda Role.

insightsVersion?

[`LambdaInsightsVersion`](aws-cdk-lib.aws_lambda.LambdaInsightsVersion.html)

Specify the version of CloudWatch Lambda insights to use for monitoring.

ipv6AllowedForDualStack?

`boolean`

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

layers?

[`ILayerVersion`](aws-cdk-lib.aws_lambda.ILayerVersion.html)`[]`

A list of layers to add to the function's execution environment.

logFormat?⚠️

`string`

Sets the logFormat for the function.

logGroup?

[`ILogGroupRef`](aws-cdk-lib.interfaces.aws_logs.ILogGroupRef.html)

The log group the function sends logs to.

logRemovalPolicy?⚠️

[`RemovalPolicy`](aws-cdk-lib.RemovalPolicy.html)

Determine the removal policy of the log group that is auto-created by this construct.

logRetention?⚠️

[`RetentionDays`](aws-cdk-lib.aws_logs.RetentionDays.html)

The number of days log events are kept in CloudWatch Logs.

logRetentionRetryOptions?

[`LogRetentionRetryOptions`](aws-cdk-lib.aws_lambda.LogRetentionRetryOptions.html)

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

logRetentionRole?

[`IRole`](aws-cdk-lib.aws_iam.IRole.html)

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

loggingFormat?

[`LoggingFormat`](aws-cdk-lib.aws_lambda.LoggingFormat.html)

Sets the loggingFormat for the function.

maxEventAge?

[`Duration`](aws-cdk-lib.Duration.html)

The maximum age of a request that Lambda sends to a function for processing.

memorySize?

`number`

The amount of memory, in MB, that is allocated to your Lambda function.

onFailure?

[`IDestination`](aws-cdk-lib.aws_lambda.IDestination.html)

The destination for failed invocations.

onSuccess?

[`IDestination`](aws-cdk-lib.aws_lambda.IDestination.html)

The destination for successful invocations.

paramsAndSecrets?

[`ParamsAndSecretsLayerVersion`](aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion.html)

Specify the configuration of Parameters and Secrets Extension.

profiling?

`boolean`

Enable profiling.

profilingGroup?

[`IProfilingGroup`](aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup.html)

Profiling Group.

projectRoot?

`string`

The path to the directory containing project config files (`package.json` or `tsconfig.json`).

recursiveLoop?

[`RecursiveLoop`](aws-cdk-lib.aws_lambda.RecursiveLoop.html)

Sets the Recursive Loop Protection for Lambda Function.

reservedConcurrentExecutions?

`number`

The maximum of concurrent executions you want to reserve for the function.

retryAttempts?

`number`

The maximum number of times to retry when the function returns an error.

role?

[`IRole`](aws-cdk-lib.aws_iam.IRole.html)

Lambda execution role.

runtime?

[`Runtime`](aws-cdk-lib.aws_lambda.Runtime.html)

The runtime environment.

runtimeManagementMode?

[`RuntimeManagementMode`](aws-cdk-lib.aws_lambda.RuntimeManagementMode.html)

Sets the runtime management configuration for a function's version.

securityGroups?

[`ISecurityGroup`](aws-cdk-lib.aws_ec2.ISecurityGroup.html)`[]`

The list of security groups to associate with the Lambda's network interfaces.

snapStart?

[`SnapStartConf`](aws-cdk-lib.aws_lambda.SnapStartConf.html)

Enable SnapStart for Lambda Function.

systemLogLevel?⚠️

`string`

Sets the system log level for the function.

systemLogLevelV2?

[`SystemLogLevel`](aws-cdk-lib.aws_lambda.SystemLogLevel.html)

Sets the system log level for the function.

tenancyConfig?

[`TenancyConfig`](aws-cdk-lib.aws_lambda.TenancyConfig.html)

The tenancy configuration for the function.

timeout?

[`Duration`](aws-cdk-lib.Duration.html)

The function execution time (in seconds) after which Lambda terminates the function.

tracing?

[`Tracing`](aws-cdk-lib.aws_lambda.Tracing.html)

Enable AWS X-Ray Tracing for Lambda Function.

vpc?

[`IVpc`](aws-cdk-lib.aws_ec2.IVpc.html)

VPC network to place Lambda network interfaces.

vpcSubnets?

[`SubnetSelection`](aws-cdk-lib.aws_ec2.SubnetSelection.html)

Where to place the network interfaces within the VPC.

* * *

### [](#adotinstrumentation)adotInstrumentation?

_Type:_ [`AdotInstrumentationConfig`](aws-cdk-lib.aws_lambda.AdotInstrumentationConfig.html) _(optional, default: No ADOT instrumentation)_

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

See also: [https://aws-otel.github.io/docs/getting-started/lambda](https://aws-otel.github.io/docs/getting-started/lambda)

* * *

### [](#allowallipv6outbound)allowAllIpv6Outbound?

_Type:_ `boolean` _(optional, default: false)_

Whether to allow the Lambda to send all ipv6 network traffic.

If set to true, there will only be a single egress rule which allows all outbound ipv6 traffic. If set to false, you must individually add traffic rules to allow the Lambda to connect to network targets using ipv6.

Do not specify this property if the `securityGroups` or `securityGroup` property is set. Instead, configure `allowAllIpv6Outbound` directly on the security group.

* * *

### [](#allowalloutbound)allowAllOutbound?

_Type:_ `boolean` _(optional, default: true)_

Whether to allow the Lambda to send all network traffic (except ipv6).

If set to false, you must individually add traffic rules to allow the Lambda to connect to network targets.

Do not specify this property if the `securityGroups` or `securityGroup` property is set. Instead, configure `allowAllOutbound` directly on the security group.

* * *

### [](#allowpublicsubnet)allowPublicSubnet?

_Type:_ `boolean` _(optional, default: false)_

Lambda Functions in a public subnet can NOT access the internet.

Use this property to acknowledge this limitation and still place the function in a public subnet.

See also: [https://stackoverflow.com/questions/52992085/why-cant-an-aws-lambda-function-inside-a-public-subnet-in-a-vpc-connect-to-the/52994841#52994841](https://stackoverflow.com/questions/52992085/why-cant-an-aws-lambda-function-inside-a-public-subnet-in-a-vpc-connect-to-the/52994841#52994841)

* * *

### [](#applicationloglevelspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)applicationLogLevel?⚠️

⚠️ **Deprecated:** Use `applicationLogLevelV2` as a property instead.

_Type:_ `string` _(optional, default: "INFO")_

Sets the application log level for the function.

* * *

### [](#applicationloglevelv2)applicationLogLevelV2?

_Type:_ [`ApplicationLogLevel`](aws-cdk-lib.aws_lambda.ApplicationLogLevel.html) _(optional, default: ApplicationLogLevel.INFO)_

Sets the application log level for the function.

* * *

### [](#architecture)architecture?

_Type:_ [`Architecture`](aws-cdk-lib.aws_lambda.Architecture.html) _(optional, default: Architecture.X86\_64)_

The system architectures compatible with this lambda function.

* * *

### [](#awssdkconnectionreuse)awsSdkConnectionReuse?

_Type:_ `boolean` _(optional, default: false (obsolete) for runtimes >= Node 18, true for runtimes <= Node 16.)_

The `AWS_NODEJS_CONNECTION_REUSE_ENABLED` environment variable does not exist in the AWS SDK for JavaScript v3.

This prop will be deprecated when the Lambda Node16 runtime is deprecated on June 12, 2024. See [https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtime-support-policy](/lambda/latest/dg/lambda-runtimes.html#runtime-support-policy)

Info for Node 16 runtimes / SDK v2 users:

Whether to automatically reuse TCP connections when working with the AWS SDK for JavaScript v2.

This sets the `AWS_NODEJS_CONNECTION_REUSE_ENABLED` environment variable to `1`.

See also: [https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html](/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html)

* * *

### [](#bundling)bundling?

_Type:_ [`BundlingOptions`](aws-cdk-lib.aws_lambda_nodejs.BundlingOptions.html) _(optional, default: use default bundling options: no minify, no sourcemap, all modules are bundled.)_

Bundling options.

* * *

### [](#code)code?

_Type:_ [`Code`](aws-cdk-lib.aws_lambda.Code.html) _(optional, default: the code is bundled by esbuild)_

The code that will be deployed to the Lambda Handler.

If included, then properties related to bundling of the code are ignored.

*   If the `code` field is specified, then you must include the `handler` property.

* * *

### [](#codesigningconfig)codeSigningConfig?

_Type:_ [`ICodeSigningConfigRef`](aws-cdk-lib.interfaces.aws_lambda.ICodeSigningConfigRef.html) _(optional, default: Not Sign the Code)_

Code signing config associated with this function.

* * *

### [](#currentversionoptions)currentVersionOptions?

_Type:_ [`VersionOptions`](aws-cdk-lib.aws_lambda.VersionOptions.html) _(optional, default: default options as described in `VersionOptions`)_

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

* * *

### [](#deadletterqueue)deadLetterQueue?

_Type:_ [`IQueue`](aws-cdk-lib.aws_sqs.IQueue.html) _(optional, default: SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`)_

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

* * *

### [](#deadletterqueueenabled)deadLetterQueueEnabled?

_Type:_ `boolean` _(optional, default: false unless `deadLetterQueue` is set, which implies DLQ is enabled.)_

Enabled DLQ.

If `deadLetterQueue` is undefined, an SQS queue with default options will be defined for your Function.

* * *

### [](#deadlettertopic)deadLetterTopic?

_Type:_ [`ITopic`](aws-cdk-lib.aws_sns.ITopic.html) _(optional, default: no SNS topic)_

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

* * *

### [](#depslockfilepath)depsLockFilePath?

_Type:_ `string` _(optional, default: the path is found by walking up parent directories searching for a `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `bun.lock` or `package-lock.json` file)_

The path to the dependencies lock file (`yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `bun.lock` or `package-lock.json`).

This will be used as the source for the volume mounted in the Docker container.

Modules specified in `nodeModules` will be installed using the right installer (`yarn`, `pnpm`, `bun` or `npm`) along with this lock file.

* * *

### [](#description)description?

_Type:_ `string` _(optional, default: No description.)_

A description of the function.

* * *

### [](#durableconfig)durableConfig?

_Type:_ [`DurableConfig`](aws-cdk-lib.aws_lambda.DurableConfig.html) _(optional, default: No durable configuration)_

The durable configuration for the function.

If durability is added to an existing function, a resource replacement will be triggered. See the 'durableConfig' section in the module README for more details.

* * *

### [](#entry)entry?

_Type:_ `string` _(optional, default: Derived from the name of the defining file and the construct's id. If the `NodejsFunction` is defined in `stack.ts` with `my-handler` as id (`new NodejsFunction(this, 'my-handler')`), the construct will look at `stack.my-handler.ts` and `stack.my-handler.js`.)_

Path to the entry file (JavaScript or TypeScript).

* * *

### [](#environment)environment?

_Type:_ `{ [string]: string }` _(optional, default: No environment variables.)_

Key-value pairs that Lambda caches and makes available for your Lambda functions.

Use environment variables to apply configuration changes, such as test and production environment configurations, without changing your Lambda function source code.

* * *

### [](#environmentencryption)environmentEncryption?

_Type:_ [`IKeyRef`](aws-cdk-lib.interfaces.aws_kms.IKeyRef.html) _(optional, default: AWS Lambda creates and uses an AWS managed customer master key (CMK).)_

The AWS KMS key that's used to encrypt your function's environment variables.

* * *

### [](#ephemeralstoragesize)ephemeralStorageSize?

_Type:_ [`Size`](aws-cdk-lib.Size.html) _(optional, default: 512 MiB)_

The size of the function’s /tmp directory in MiB.

* * *

### [](#events)events?

_Type:_ [`IEventSource`](aws-cdk-lib.aws_lambda.IEventSource.html)`[]` _(optional, default: No event sources.)_

Event sources for this function.

You can also add event sources using `addEventSource`.

* * *

### [](#filesystem)filesystem?

_Type:_ [`FileSystem`](aws-cdk-lib.aws_lambda.FileSystem.html) _(optional, default: will not mount any filesystem)_

The filesystem configuration for the lambda function.

* * *

### [](#functionname)functionName?

_Type:_ `string` _(optional, default: AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.)_

A name for the function.

* * *

### [](#handler)handler?

_Type:_ `string` _(optional, default: handler)_

The name of the exported handler in the entry file.

*   If the `code` property is supplied, then you must include the `handler` property. The handler should be the name of the file that contains the exported handler and the function that should be called when the AWS Lambda is invoked. For example, if you had a file called `myLambda.js` and the function to be invoked was `myHandler`, then you should input `handler` property as `myLambda.myHandler`.
    
*   If the `code` property is not supplied and the handler input does not contain a `.`, then the handler is prefixed with `index.` (index period). Otherwise, the handler property is not modified.
    

* * *

### [](#initialpolicy)initialPolicy?

_Type:_ [`PolicyStatement`](aws-cdk-lib.aws_iam.PolicyStatement.html)`[]` _(optional, default: No policy statements are added to the created Lambda role.)_

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

* * *

### [](#insightsversion)insightsVersion?

_Type:_ [`LambdaInsightsVersion`](aws-cdk-lib.aws_lambda.LambdaInsightsVersion.html) _(optional, default: No Lambda Insights)_

Specify the version of CloudWatch Lambda insights to use for monitoring.

See also: [https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-Getting-Started-docker.html](/AmazonCloudWatch/latest/monitoring/Lambda-Insights-Getting-Started-docker.html)

* * *

### [](#ipv6allowedfordualstack)ipv6AllowedForDualStack?

_Type:_ `boolean` _(optional, default: false)_

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

Only used if 'vpc' is supplied.

* * *

### [](#layers)layers?

_Type:_ [`ILayerVersion`](aws-cdk-lib.aws_lambda.ILayerVersion.html)`[]` _(optional, default: No layers.)_

A list of layers to add to the function's execution environment.

You can configure your Lambda function to pull in additional code during initialization in the form of layers. Layers are packages of libraries or other dependencies that can be used by multiple functions.

* * *

### [](#logformatspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)logFormat?⚠️

⚠️ **Deprecated:** Use `loggingFormat` as a property instead.

_Type:_ `string` _(optional, default: "Text")_

Sets the logFormat for the function.

* * *

### [](#loggroup)logGroup?

_Type:_ [`ILogGroupRef`](aws-cdk-lib.interfaces.aws_logs.ILogGroupRef.html) _(optional, default: `/aws/lambda/${this.functionName}` - default log group created by Lambda)_

The log group the function sends logs to.

By default, Lambda functions send logs to an automatically created default log group named /aws/lambda/<function name>. However you cannot change the properties of this auto-created log group using the AWS CDK, e.g. you cannot set a different log retention.

Use the `logGroup` property to create a fully customizable LogGroup ahead of time, and instruct the Lambda function to send logs to it.

Providing a user-controlled log group was rolled out to commercial regions on 2023-11-16. If you are deploying to another type of region, please check regional availability first.

* * *

### [](#logremovalpolicyspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)logRemovalPolicy?⚠️

⚠️ **Deprecated:** use `logGroup` instead

_Type:_ [`RemovalPolicy`](aws-cdk-lib.RemovalPolicy.html) _(optional, default: RemovalPolicy.Retain)_

Determine the removal policy of the log group that is auto-created by this construct.

Normally you want to retain the log group so you can diagnose issues from logs even after a deployment that no longer includes the log group. In that case, use the normal date-based retention policy to age out your logs.

* * *

### [](#logretentionspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)logRetention?⚠️

⚠️ **Deprecated:** use `logGroup` instead

_Type:_ [`RetentionDays`](aws-cdk-lib.aws_logs.RetentionDays.html) _(optional, default: logs.RetentionDays.INFINITE)_

The number of days log events are kept in CloudWatch Logs.

When updating this property, unsetting it doesn't remove the log retention policy. To remove the retention policy, set the value to `INFINITE`.

This is a legacy API and we strongly recommend you move away from it if you can. Instead create a fully customizable log group with `logs.LogGroup` and use the `logGroup` property to instruct the Lambda function to send logs to it. Migrating from `logRetention` to `logGroup` will cause the name of the log group to change. Users and code and referencing the name verbatim will have to adjust.

In AWS CDK code, you can access the log group name directly from the LogGroup construct:

    import * as logs from 'aws-cdk-lib/aws-logs';
    
    declare const myLogGroup: logs.LogGroup;
    myLogGroup.logGroupName;
    

* * *

### [](#logretentionretryoptions)logRetentionRetryOptions?

_Type:_ [`LogRetentionRetryOptions`](aws-cdk-lib.aws_lambda.LogRetentionRetryOptions.html) _(optional, default: Default AWS SDK retry options.)_

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can. `logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

* * *

### [](#logretentionrole)logRetentionRole?

_Type:_ [`IRole`](aws-cdk-lib.aws_iam.IRole.html) _(optional, default: A new role is created.)_

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can. `logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

* * *

### [](#loggingformat)loggingFormat?

_Type:_ [`LoggingFormat`](aws-cdk-lib.aws_lambda.LoggingFormat.html) _(optional, default: LoggingFormat.TEXT)_

Sets the loggingFormat for the function.

* * *

### [](#maxeventage)maxEventAge?

_Type:_ [`Duration`](aws-cdk-lib.Duration.html) _(optional, default: Duration.hours(6))_

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds Maximum: 6 hours

* * *

### [](#memorysize)memorySize?

_Type:_ `number` _(optional, default: 128)_

The amount of memory, in MB, that is allocated to your Lambda function.

Lambda uses this value to proportionally allocate the amount of CPU power. For more information, see Resource Model in the AWS Lambda Developer Guide.

* * *

### [](#onfailure)onFailure?

_Type:_ [`IDestination`](aws-cdk-lib.aws_lambda.IDestination.html) _(optional, default: no destination)_

The destination for failed invocations.

* * *

### [](#onsuccess)onSuccess?

_Type:_ [`IDestination`](aws-cdk-lib.aws_lambda.IDestination.html) _(optional, default: no destination)_

The destination for successful invocations.

* * *

### [](#paramsandsecrets)paramsAndSecrets?

_Type:_ [`ParamsAndSecretsLayerVersion`](aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion.html) _(optional, default: No Parameters and Secrets Extension)_

Specify the configuration of Parameters and Secrets Extension.

See also: [https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html](/systems-manager/latest/userguide/ps-integration-lambda-extensions.html)

* * *

### [](#profiling)profiling?

_Type:_ `boolean` _(optional, default: No profiling.)_

Enable profiling.

See also: [https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html](/codeguru/latest/profiler-ug/setting-up-lambda.html)

* * *

### [](#profilinggroup)profilingGroup?

_Type:_ [`IProfilingGroup`](aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup.html) _(optional, default: A new profiling group will be created if `profiling` is set.)_

Profiling Group.

See also: [https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html](/codeguru/latest/profiler-ug/setting-up-lambda.html)

* * *

### [](#projectroot)projectRoot?

_Type:_ `string` _(optional, default: the directory containing the `depsLockFilePath`)_

The path to the directory containing project config files (`package.json` or `tsconfig.json`).

* * *

### [](#recursiveloop)recursiveLoop?

_Type:_ [`RecursiveLoop`](aws-cdk-lib.aws_lambda.RecursiveLoop.html) _(optional, default: RecursiveLoop.Terminate)_

Sets the Recursive Loop Protection for Lambda Function.

It lets Lambda detect and terminate unintended recursive loops.

* * *

### [](#reservedconcurrentexecutions)reservedConcurrentExecutions?

_Type:_ `number` _(optional, default: No specific limit - account limit.)_

The maximum of concurrent executions you want to reserve for the function.

See also: [https://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html](/lambda/latest/dg/concurrent-executions.html)

* * *

### [](#retryattempts)retryAttempts?

_Type:_ `number` _(optional, default: 2)_

The maximum number of times to retry when the function returns an error.

Minimum: 0 Maximum: 2

* * *

### [](#role)role?

_Type:_ [`IRole`](aws-cdk-lib.aws_iam.IRole.html) _(optional, default: A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.)_

Lambda execution role.

This is the role that will be assumed by the function upon execution. It controls the permissions that the function will have. The Role must be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and "service-role/AWSLambdaVPCAccessExecutionRole".

* * *

### [](#runtime)runtime?

_Type:_ [`Runtime`](aws-cdk-lib.aws_lambda.Runtime.html) _(optional, default: `Runtime.NODEJS_LATEST` if the `@aws-cdk/aws-lambda-nodejs:useLatestRuntimeVersion` feature flag is enabled, otherwise `Runtime.NODEJS_16_X`)_

The runtime environment.

Only runtimes of the Node.js family are supported.

* * *

### [](#runtimemanagementmode)runtimeManagementMode?

_Type:_ [`RuntimeManagementMode`](aws-cdk-lib.aws_lambda.RuntimeManagementMode.html) _(optional, default: Auto)_

Sets the runtime management configuration for a function's version.

* * *

### [](#securitygroups)securityGroups?

_Type:_ [`ISecurityGroup`](aws-cdk-lib.aws_ec2.ISecurityGroup.html)`[]` _(optional, default: If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.)_

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

* * *

### [](#snapstart)snapStart?

_Type:_ [`SnapStartConf`](aws-cdk-lib.aws_lambda.SnapStartConf.html) _(optional, default: No snapstart)_

Enable SnapStart for Lambda Function.

SnapStart is currently supported for Java 11, Java 17, Python 3.12, Python 3.13, and .NET 8 runtime

* * *

### [](#systemloglevelspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)systemLogLevel?⚠️

⚠️ **Deprecated:** Use `systemLogLevelV2` as a property instead.

_Type:_ `string` _(optional, default: "INFO")_

Sets the system log level for the function.

* * *

### [](#systemloglevelv2)systemLogLevelV2?

_Type:_ [`SystemLogLevel`](aws-cdk-lib.aws_lambda.SystemLogLevel.html) _(optional, default: SystemLogLevel.INFO)_

Sets the system log level for the function.

* * *

### [](#tenancyconfig)tenancyConfig?

_Type:_ [`TenancyConfig`](aws-cdk-lib.aws_lambda.TenancyConfig.html) _(optional, default: Tenant isolation is not enabled)_

The tenancy configuration for the function.

* * *

### [](#timeout)timeout?

_Type:_ [`Duration`](aws-cdk-lib.Duration.html) _(optional, default: Duration.seconds(3))_

The function execution time (in seconds) after which Lambda terminates the function.

Because the execution time affects cost, set this value based on the function's expected execution time.

* * *

### [](#tracing)tracing?

_Type:_ [`Tracing`](aws-cdk-lib.aws_lambda.Tracing.html) _(optional, default: Tracing.Disabled)_

Enable AWS X-Ray Tracing for Lambda Function.

* * *

### [](#vpc)vpc?

_Type:_ [`IVpc`](aws-cdk-lib.aws_ec2.IVpc.html) _(optional, default: Function is not placed within a VPC.)_

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC. This is required when `vpcSubnets` is specified.

* * *

### [](#vpcsubnets)vpcSubnets?

_Type:_ [`SubnetSelection`](aws-cdk-lib.aws_ec2.SubnetSelection.html) _(optional, default: the Vpc default strategy if not specified)_

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

[](#properties)Properties
-------------------------

Name

Type

Description

architecture

[`Architecture`](aws-cdk-lib.aws_lambda.Architecture.html)

The architecture of this Lambda Function (this is an optional attribute and defaults to X86\_64).

connections

[`Connections`](aws-cdk-lib.aws_ec2.Connections.html)

Access the Connections object.

currentVersion

[`Version`](aws-cdk-lib.aws_lambda.Version.html)

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

env

[`ResourceEnvironment`](aws-cdk-lib.interfaces.ResourceEnvironment.html)

The environment this resource belongs to.

functionArn

`string`

ARN of this function.

functionName

`string`

Name of this function.

functionRef

[`FunctionReference`](aws-cdk-lib.interfaces.aws_lambda.FunctionReference.html)

A reference to a Function resource.

grantPrincipal

[`IPrincipal`](aws-cdk-lib.aws_iam.IPrincipal.html)

The principal this Lambda Function is running as.

isBoundToVpc

`boolean`

Whether or not this Lambda function was bound to a VPC.

latestVersion

[`IVersion`](aws-cdk-lib.aws_lambda.IVersion.html)

The `$LATEST` version of this function.

logGroup

[`ILogGroup`](aws-cdk-lib.aws_logs.ILogGroup.html)

The LogGroup where the Lambda function's logs are made available.

node

[`Node`](constructs.Node.html)

The tree node.

permissionsNode

[`Node`](constructs.Node.html)

The construct node where permissions are attached.

resourceArnsForGrantInvoke

`string[]`

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

runtime

[`Runtime`](aws-cdk-lib.aws_lambda.Runtime.html)

The runtime configured for this lambda.

stack

[`Stack`](aws-cdk-lib.Stack.html)

The stack in which this resource is defined.

deadLetterQueue?

[`IQueue`](aws-cdk-lib.aws_sqs.IQueue.html)

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

deadLetterTopic?

[`ITopic`](aws-cdk-lib.aws_sns.ITopic.html)

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

role?

[`IRole`](aws-cdk-lib.aws_iam.IRole.html)

Execution role associated with this function.

tenancyConfig?

[`TenancyConfig`](aws-cdk-lib.aws_lambda.TenancyConfig.html)

The tenancy configuration for this function.

timeout?

[`Duration`](aws-cdk-lib.Duration.html)

The timeout configured for this lambda.

* * *

### [](#architecture-1)architecture

_Type:_ [`Architecture`](aws-cdk-lib.aws_lambda.Architecture.html)

The architecture of this Lambda Function (this is an optional attribute and defaults to X86\_64).

* * *

### [](#connections)connections

_Type:_ [`Connections`](aws-cdk-lib.aws_ec2.Connections.html)

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

* * *

### [](#currentversion)currentVersion

_Type:_ [`Version`](aws-cdk-lib.aws_lambda.Version.html)

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions` prop when initializing the `lambda.Function`.

* * *

### [](#env)env

_Type:_ [`ResourceEnvironment`](aws-cdk-lib.interfaces.ResourceEnvironment.html)

The environment this resource belongs to.

For resources that are created and managed in a Stack (those created by creating new class instances like `new Role()`, `new Bucket()`, etc.), this is always the same as the environment of the stack they belong to.

For referenced resources (those obtained from referencing methods like `Role.fromRoleArn()`, `Bucket.fromBucketName()`, etc.), they might be different than the stack they were imported into.

* * *

### [](#functionarn)functionArn

_Type:_ `string`

ARN of this function.

* * *

### [](#functionname-1)functionName

_Type:_ `string`

Name of this function.

* * *

### [](#functionref)functionRef

_Type:_ [`FunctionReference`](aws-cdk-lib.interfaces.aws_lambda.FunctionReference.html)

A reference to a Function resource.

* * *

### [](#grantprincipal)grantPrincipal

_Type:_ [`IPrincipal`](aws-cdk-lib.aws_iam.IPrincipal.html)

The principal this Lambda Function is running as.

* * *

### [](#isboundtovpc)isBoundToVpc

_Type:_ `boolean`

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

* * *

### [](#latestversion)latestVersion

_Type:_ [`IVersion`](aws-cdk-lib.aws_lambda.IVersion.html)

The `$LATEST` version of this function.

Note that this is reference to a non-specific AWS Lambda version, which means the function this version refers to can return different results in different invocations.

To obtain a reference to an explicit version which references the current function configuration, use `lambdaFunction.currentVersion` instead.

* * *

### [](#loggroup-1)logGroup

_Type:_ [`ILogGroup`](aws-cdk-lib.aws_logs.ILogGroup.html)

The LogGroup where the Lambda function's logs are made available.

If either `logRetention` is set or this property is called, a CloudFormation custom resource is added to the stack that pre-creates the log group as part of the stack deployment, if it already doesn't exist, and sets the correct log retention period (never expire, by default).

Further, if the log group already exists and the `logRetention` is not set, the custom resource will reset the log retention to never expire even if it was configured with a different value.

* * *

### [](#node)node

_Type:_ [`Node`](constructs.Node.html)

The tree node.

* * *

### [](#permissionsnode)permissionsNode

_Type:_ [`Node`](constructs.Node.html)

The construct node where permissions are attached.

* * *

### [](#resourcearnsforgrantinvoke)resourceArnsForGrantInvoke

_Type:_ `string[]`

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

* * *

### [](#runtime-1)runtime

_Type:_ [`Runtime`](aws-cdk-lib.aws_lambda.Runtime.html)

The runtime configured for this lambda.

* * *

### [](#stack)stack

_Type:_ [`Stack`](aws-cdk-lib.Stack.html)

The stack in which this resource is defined.

* * *

### [](#deadletterqueue-1)deadLetterQueue?

_Type:_ [`IQueue`](aws-cdk-lib.aws_sqs.IQueue.html) _(optional)_

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

* * *

### [](#deadlettertopic-1)deadLetterTopic?

_Type:_ [`ITopic`](aws-cdk-lib.aws_sns.ITopic.html) _(optional)_

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

* * *

### [](#role-1)role?

_Type:_ [`IRole`](aws-cdk-lib.aws_iam.IRole.html) _(optional)_

Execution role associated with this function.

* * *

### [](#tenancyconfig-1)tenancyConfig?

_Type:_ [`TenancyConfig`](aws-cdk-lib.aws_lambda.TenancyConfig.html) _(optional)_

The tenancy configuration for this function.

* * *

### [](#timeout-1)timeout?

_Type:_ [`Duration`](aws-cdk-lib.Duration.html) _(optional)_

The timeout configured for this lambda.

[](#methods)Methods
-------------------

Name

Description

addAlias(aliasName, options?)

Defines an alias for this function.

addEnvironment(key, value, options?)

Adds an environment variable to this Lambda function.

addEventSource(source)

Adds an event source to this function.

addEventSourceMapping(id, options)

Adds an event source that maps to this AWS Lambda function.

addFunctionUrl(options?)

Adds a url to this lambda function.

addLayers(...layers)

Adds one or more Lambda Layers to this Lambda function.

addPermission(id, permission)

Adds a permission to the Lambda resource policy.

addToRolePolicy(statement)

Adds a statement to the IAM role assumed by the instance.

applyRemovalPolicy(policy)

Apply the given removal policy to this resource.

configureAsyncInvoke(options)

Configures options for asynchronous invocation.

considerWarningOnInvokeFunctionPermissions(scope, action)

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

grantInvoke(grantee)

Grant the given identity permissions to invoke this Lambda.

grantInvokeCompositePrincipal(compositePrincipal)

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

grantInvokeLatestVersion(grantee)

Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda.

grantInvokeUrl(grantee)

Grant the given identity permissions to invoke this Lambda Function URL.

grantInvokeVersion(grantee, version)

Grant the given identity permissions to invoke the given version of this Lambda.

invalidateVersionBasedOn(x)

Mix additional information into the hash of the Version object.

metric(metricName, props?)

Return the given named metric for this Function.

metricDuration(props?)

How long execution of this Lambda takes.

metricErrors(props?)

How many invocations of this Lambda fail.

metricInvocations(props?)

How often this Lambda is invoked.

metricThrottles(props?)

How often this Lambda is throttled.

toString()

Returns a string representation of this construct.

* * *

### [](#addwbraliasaliasname-options)addAlias(aliasName, options?)

    public addAlias(aliasName: string, options?: AliasOptions): Alias
    

_Parameters_

*   **aliasName** `string` — The name of the alias.
*   **options** [`AliasOptions`](aws-cdk-lib.aws_lambda.AliasOptions.html) — Alias options.

_Returns_

*   [`Alias`](aws-cdk-lib.aws_lambda.Alias.html)

Defines an alias for this function.

The alias will automatically be updated to point to the latest version of the function as it is being updated during a deployment.

    declare const fn: lambda.Function;
    
    fn.addAlias('Live');
    
    // Is equivalent to
    
    new lambda.Alias(this, 'AliasLive', {
      aliasName: 'Live',
      version: fn.currentVersion,
    });
    

* * *

### [](#addwbrenvironmentkey-value-options)addEnvironment(key, value, options?)

    public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
    

_Parameters_

*   **key** `string` — The environment variable key.
*   **value** `string` — The environment variable's value.
*   **options** [`EnvironmentOptions`](aws-cdk-lib.aws_lambda.EnvironmentOptions.html) — Environment variable options.

_Returns_

*   [`Function`](aws-cdk-lib.aws_lambda.Function.html)

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

* * *

### [](#addwbreventwbrsourcesource)addEventSource(source)

    public addEventSource(source: IEventSource): void
    

_Parameters_

*   **source** [`IEventSource`](aws-cdk-lib.aws_lambda.IEventSource.html)

Adds an event source to this function.

Event sources are implemented in the aws-cdk-lib/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:

    import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
    myFunction.addEventSource(new SqsEventSource(myQueue));
    

* * *

### [](#addwbreventwbrsourcewbrmappingid-options)addEventSourceMapping(id, options)

    public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
    

_Parameters_

*   **id** `string`
*   **options** [`EventSourceMappingOptions`](aws-cdk-lib.aws_lambda.EventSourceMappingOptions.html)

_Returns_

*   [`EventSourceMapping`](aws-cdk-lib.aws_lambda.EventSourceMapping.html)

Adds an event source that maps to this AWS Lambda function.

* * *

### [](#addwbrfunctionwbrurloptions)addFunctionUrl(options?)

    public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
    

_Parameters_

*   **options** [`FunctionUrlOptions`](aws-cdk-lib.aws_lambda.FunctionUrlOptions.html)

_Returns_

*   [`FunctionUrl`](aws-cdk-lib.aws_lambda.FunctionUrl.html)

Adds a url to this lambda function.

* * *

### [](#addwbrlayerslayers)addLayers(...layers)

    public addLayers(...layers: ILayerVersion[]): void
    

_Parameters_

*   **layers** [`ILayerVersion`](aws-cdk-lib.aws_lambda.ILayerVersion.html) — the layers to be added.

Adds one or more Lambda Layers to this Lambda function.

* * *

### [](#addwbrpermissionid-permission)addPermission(id, permission)

    public addPermission(id: string, permission: Permission): void
    

_Parameters_

*   **id** `string` — The id for the permission construct.
*   **permission** [`Permission`](aws-cdk-lib.aws_lambda.Permission.html) — The permission to grant to this Lambda function.

Adds a permission to the Lambda resource policy.

See also: \[Permission for details.\](Permission for details.)

* * *

### [](#addwbrtowbrrolewbrpolicystatement)addToRolePolicy(statement)

    public addToRolePolicy(statement: PolicyStatement): void
    

_Parameters_

*   **statement** [`PolicyStatement`](aws-cdk-lib.aws_iam.PolicyStatement.html)

Adds a statement to the IAM role assumed by the instance.

* * *

### [](#applywbrremovalwbrpolicypolicy)applyRemovalPolicy(policy)

    public applyRemovalPolicy(policy: RemovalPolicy): void
    

_Parameters_

*   **policy** [`RemovalPolicy`](aws-cdk-lib.RemovalPolicy.html)

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops being managed by CloudFormation, either because you've removed it from the CDK application or because you've made a change that requires the resource to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

* * *

### [](#configurewbrasyncwbrinvokeoptions)configureAsyncInvoke(options)

    public configureAsyncInvoke(options: EventInvokeConfigOptions): void
    

_Parameters_

*   **options** [`EventInvokeConfigOptions`](aws-cdk-lib.aws_lambda.EventInvokeConfigOptions.html)

Configures options for asynchronous invocation.

* * *

### [](#considerwbrwarningwbronwbrinvokewbrfunctionwbrpermissionsscope-action)considerWarningOnInvokeFunctionPermissions(scope, action)

    public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
    

_Parameters_

*   **scope** [`Construct`](constructs.Construct.html)
*   **action** `string`

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

*   function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases. This function is overridden as a noOp for QualifiedFunctionBase.

* * *

### [](#grantwbrinvokegrantee)grantInvoke(grantee)

    public grantInvoke(grantee: IGrantable): Grant
    

_Parameters_

*   **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html)

_Returns_

*   [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Grant the given identity permissions to invoke this Lambda.

\[disable-awslint:no-grants\]

* * *

### [](#grantwbrinvokewbrcompositewbrprincipalcompositeprincipal)grantInvokeCompositePrincipal(compositePrincipal)

    public grantInvokeCompositePrincipal(compositePrincipal: CompositePrincipal): Grant[]
    

_Parameters_

*   **compositePrincipal** [`CompositePrincipal`](aws-cdk-lib.aws_iam.CompositePrincipal.html)

_Returns_

*   [`Grant`](aws-cdk-lib.aws_iam.Grant.html)`[]`

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

\[disable-awslint:no-grants\]

* * *

### [](#grantwbrinvokewbrlatestwbrversiongrantee)grantInvokeLatestVersion(grantee)

    public grantInvokeLatestVersion(grantee: IGrantable): Grant
    

_Parameters_

*   **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html)

_Returns_

*   [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda.

\[disable-awslint:no-grants\]

* * *

### [](#grantwbrinvokewbrurlgrantee)grantInvokeUrl(grantee)

    public grantInvokeUrl(grantee: IGrantable): Grant
    

_Parameters_

*   **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html)

_Returns_

*   [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Grant the given identity permissions to invoke this Lambda Function URL.

\[disable-awslint:no-grants\]

* * *

### [](#grantwbrinvokewbrversiongrantee-version)grantInvokeVersion(grantee, version)

    public grantInvokeVersion(grantee: IGrantable, version: IVersion): Grant
    

_Parameters_

*   **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html)
*   **version** [`IVersion`](aws-cdk-lib.aws_lambda.IVersion.html)

_Returns_

*   [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Grant the given identity permissions to invoke the given version of this Lambda.

\[disable-awslint:no-grants\]

* * *

### [](#invalidatewbrversionwbrbasedwbronx)invalidateVersionBasedOn(x)

    public invalidateVersionBasedOn(x: string): void
    

_Parameters_

*   **x** `string`

Mix additional information into the hash of the Version object.

The Lambda Function construct does its best to automatically create a new Version when anything about the Function changes (its code, its layers, any of the other properties).

However, you can sometimes source information from places that the CDK cannot look into, like the deploy-time values of SSM parameters. In those cases, the CDK would not force the creation of a new Version object when it actually should.

This method can be used to invalidate the current Version object. Pass in any string into this method, and make sure the string changes when you know a new Version needs to be created.

This method may be called more than once.

* * *

### [](#metricmetricname-props)metric(metricName, props?)

    public metric(metricName: string, props?: MetricOptions): Metric
    

_Parameters_

*   **metricName** `string`
*   **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

*   [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Return the given named metric for this Function.

* * *

### [](#metricwbrdurationprops)metricDuration(props?)

    public metricDuration(props?: MetricOptions): Metric
    

_Parameters_

*   **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

*   [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

How long execution of this Lambda takes.

Average over 5 minutes

* * *

### [](#metricwbrerrorsprops)metricErrors(props?)

    public metricErrors(props?: MetricOptions): Metric
    

_Parameters_

*   **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

*   [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

How many invocations of this Lambda fail.

Sum over 5 minutes

* * *

### [](#metricwbrinvocationsprops)metricInvocations(props?)

    public metricInvocations(props?: MetricOptions): Metric
    

_Parameters_

*   **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

*   [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

How often this Lambda is invoked.

Sum over 5 minutes

* * *

### [](#metricwbrthrottlesprops)metricThrottles(props?)

    public metricThrottles(props?: MetricOptions): Metric
    

_Parameters_

*   **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

*   [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

How often this Lambda is throttled.

Sum over 5 minutes

* * *

### [](#towbrstring)toString()

    public toString(): string
    

_Returns_

*   `string`

Returns a string representation of this construct.