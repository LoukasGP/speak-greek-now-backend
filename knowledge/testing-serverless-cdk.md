Testing serverless functions uses traditional test types and techniques, but you must also consider testing serverless applications as a whole. Cloud-based tests will provide the **most accurate** measure of quality of both your functions and serverless applications.

A serverless application architecture includes managed services that provide critical application functionality through API calls. For this reason, your development cycle should include automated tests that verify functionality when your function and services interact.

If you do not create cloud-based tests, you could encounter issues due to differences between your local environment and the deployed environment. Your continuous integration process should run tests against a suite of resources provisioned in the cloud before promoting your code to the next deployment environment, such as QA, Staging, or Production.

Continue reading this short guide to learn about testing strategies for serverless applications, or visit the [Serverless Test Samples repository](https://github.com/aws-samples/serverless-test-samples) to dive in with practical examples, specific to your chosen language and runtime.

![illustration showing the relationship between types of tests](/images/lambda/latest/dg/images/test-type-illustration2.png)

For serverless testing, you will still write _unit_, _integration_ and _end-to-end_ tests.

*   **Unit tests** - Tests that run against an isolated block of code. For example, verifying the business logic to calculate the delivery charge given a particular item and destination.
    
*   **Integration tests** - Tests involving two or more components or services that interact, typically in a cloud environment. For example, verifying a function processes events from a queue.
    
*   **End-to-end tests** - Tests that verify behavior across an entire application. For example, ensuring infrastructure is set up correctly and that events flow between services as expected to record a customer's order.
    

Targeted business outcomes


----------------------------

Testing serverless solutions may require slightly more time to set up tests that verify event-driven interactions between services. Keep the following practical business reasons in mind as you read this guide:

*   Increase the quality of your application
    
*   Decrease time to build features and fix bugs
    

The quality of an application depends on testing a variety of scenarios to verify functionality. Carefully considering the business scenarios and automating those tests to run against cloud services will raise the quality of your application.

Software bugs and configuration problems have the least impact on cost and schedule when caught during an iterative development cycle. If issues remain undetected during development, finding and fixing in production requires more effort by more people.

A well planned serverless testing strategy will increase software quality and improve iteration time by verifying your Lambda functions and applications perform as expected in a cloud environment.

What to test


--------------

We recommend adopting a testing strategy that tests managed service _behaviors_, cloud configuration, security policies, and the integration with your code to improve software quality. _Behavior testing_, also known as black box testing, verifies a system works as expected without knowing all the internals.

*   Run unit tests to check business logic inside Lambda functions.
    
*   Verify integrated services are actually invoked, and input parameters are correct.
    
*   Check that an event goes through all expected services end-to-end in a workflow.
    

In traditional server-based architecture, teams often define a scope for testing to only include code that runs on the application server. Other components, services, or dependencies are often considered external and out of scope for testing.

Serverless applications often consist of small units of work, such as Lambda functions that retrieve products from a database, or process items from a queue, or resize an image in storage. Each component runs in their own environment. Teams will likely be responsible for many of these small units within a single application.

Some application functionality can be delegated entirely to managed services such as Amazon S3, or created without using any internally developed code. There is no need to test these managed services, but you do need to test the integration with these services.

How to test serverless


------------------------

You are probably familiar with how to test applications deployed locally: You write tests that run against code running entirely on your desktop operating system, or inside containers. For example, you might invoke a local web service component with a request and then make assertions about the response.

Serverless solutions are built from your function code and cloud-based managed services, such as queues, databases, event buses, and messaging systems. These components are all connected through an _event-driven architecture_, where messages, called _events_, flow from one resource to another. These interactions can be synchronous, such as when a web service returns results immediately, or an asynchronous action which completes at a later time, such as placing items in a queue or starting a workflow step. Your testing strategy must include both scenarios and test the interactions between services. For asynchronous interactions, you may need to detect side effects in downstream components that may not be immediately observable.

Replicating an entire cloud environment, including queues, database tables, event buses, security policies, and more, is not practical. You will inevitably encounter issues due to differences between your local environment and your deployed environments in the cloud. The variations between your environments will increase the time to reproduce and fix bugs.

In serverless applications, architecture components commonly exist entirely in the cloud, so testing against code and services in the cloud is necessary to develop features and fix bugs.

Testing techniques


--------------------

In reality, your testing strategy will likely include a mix of techniques to increase quality of your solutions. You will use quick interactive tests to debug functions in the console, automated unit tests to check isolated business logic, verification of calls to external services with mocks, and occasional testing against emulators that mimic a service.

*   [Testing in the cloud](#testing-in-the-cloud): You deploy infrastructure and code to test with actual services, security policies, configurations and infrastructure specific parameters. Cloud-based tests provide the **most accurate** measure of quality of your code.
    
    Debugging a function in the console is a quick way to test in the cloud. You can choose from a library of sample test events or create a custom event to test a function in isolation. You can also share test events through the console with your team.
    
    To **automate** testing in the development and build lifecycle, you will need to test outside of the console. See the language specific testing sections in this guide for automation strategies and resources.
    
*   [Testing with mocks](#testing-with-mocks): Mocks are objects within your code that simulate and stand-in for an external service. Mocks provide pre-defined behavior to verify service calls and parameters. A _fake_ is a mock implementation that takes shortcuts to simplify or improve performance. For example, a fake data access object might return data from an in-memory datastore. Mocks can mimic and simplify complex dependencies, but can also lead to more mocks in order to replace nested dependencies.
    
*   [Testing locally using AWS SAM CLI](#testing-with-local-containers): Use AWS SAM CLI to locally invoke Lambda functions in Docker containers that use the same runtime environment as AWS Lambda. You can test function logic and event processing without deploying to the cloud.
    
*   [Testing with emulation](#testing-with-emulation): Use the [LocalStack integration in VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/lambda-localstack.html) to emulate multiple AWS services locally for testing service integrations.
    

### Testing in the cloud

Testing in the cloud is valuable for all phases of testing, including unit tests, integration tests, and end-to-end tests. When you run tests against cloud-based code that also interacts with cloud-based services, you get the **most accurate** measure of quality of your code.

A convenient way to run a Lambda function in the cloud is with a test event in the AWS Management Console. A _test event_ is a JSON input to your function. If your function does not require input, the event can be an empty JSON document `({})`. The console provides sample events for a variety of service integrations. After creating an event in the console, you can also share it with your team to make testing easier and consistent.

Learn how to [debug a sample function in the console](./testing-functions.html).

###### Note

Although running functions in the console is a quick way to debug, **automating** your test cycles is essential to increase application quality and development speed.

Test automation samples are available in the [Serverless Test Samples repository](https://github.com/aws-samples/serverless-test-samples). The following command line runs an automated [Python integration test example](https://github.com/aws-samples/serverless-test-samples/blob/main/python-test-samples/apigw-lambda/tests/integration/test_api_gateway.py):

`python -m pytest -s tests/integration -v`

Although the test runs locally, it interacts with cloud-based resources. These resources have been deployed using the AWS Serverless Application Model and AWS SAM command line tool. The test code first retrieves the deployed stack outputs, which includes the API endpoint, function ARN, and security role. Next, the test sends a request to the API endpoint, which responds with a list of Amazon S3 buckets. This test runs entirely against cloud-based resources to verify those resources are deployed, secured, and work as expected.

`========================= test session starts =========================       platform darwin -- Python 3.10.10, pytest-7.3.1, pluggy-1.0.0       -- /Users/t/code/aws/serverless-test-samples/python-test-samples/apigw-lambda/venv/bin/python       cachedir: .pytest_cache       rootdir: /Users/t/code/aws/serverless-test-samples/python-test-samples/apigw-lambda       plugins: mock-3.10.0       collected 1 item                                                                                                                tests/integration/test_api_gateway.py::TestApiGateway::test_api_gateway         --> Stack outputs:          HelloWorldApi         = https://p7teqs3162.execute-api.us-east-2.amazonaws.com/Prod/hello/         > API Gateway endpoint URL for Prod stage for Hello World function          PythonTestDemo         = arn:aws:lambda:us-east-2:123456789012:function:testing-apigw-lambda-PythonTestDemo-iSij8evaTdxl         > Hello World Lambda Function ARN          PythonTestDemoIamRole         = arn:aws:iam::123456789012:role/testing-apigw-lambda-PythonTestDemoRole-IZELQQ9MG4HQ         > Implicit IAM Role created for Hello World function        --> Found API endpoint for "testing-apigw-lambda" stack...       --> https://p7teqs3162.execute-api.us-east-2.amazonaws.com/Prod/hello/       API Gateway response:       amplify-dev-123456789-deployment|myapp-prod-p-loggingbucket-123456|s3-java-bucket-123456789       PASSED        ========================= 1 passed in 1.53s =========================` 
      

For cloud-native application development, testing in the cloud provides the following benefits:

*   You can test **every** available service.
    
*   You are always using the most recent service APIs and return values.
    
*   A cloud test environment closely resembles your production environment.
    
*   Tests can cover security policies, service quotas, configurations and infrastructure specific parameters.
    
*   Every developer can quickly create one or more testing environments in the cloud.
    
*   Cloud tests increase confidence your code will run correctly in production.
    

Testing in the cloud does have some disadvantages. The most obvious negative of testing in the cloud is that deployments to cloud environments typically take longer than deployments to a local desktop environments.

Fortunately, tools such as [AWS Serverless Application Model (AWS SAM) Accelerate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html), [AWS Cloud Development Kit (AWS CDK) watch mode](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-deploy-watch), and [SST](https://sst.dev/) (3rd party) reduce the latency involved with cloud deployment iterations. These tools can monitor your infrastructure and code and automatically deploy incremental updates into your cloud environment.

###### Note

See how to [create infrastructure as code](https://docs.aws.amazon.com/serverless/latest/devguide/serverless-dev-workflow.html#dev_create-infrastructure-with-code) in the _Serverless Developer Guide_ to learn more about AWS Serverless Application Model, CloudFormation, and AWS Cloud Development Kit (AWS CDK).

Unlike local testing, testing in the cloud requires additional resources which may incur service costs. Creating isolated testing environments may increase the burden on your DevOps teams, especially in organizations with strict controls around accounts and infrastructure. Even so, when working with complex infrastructure scenarios, the cost in developer time to set up and maintain an intricate local environment could be similar (or more costly) than using disposable testing environments created with Infrastructure as Code automation tools.

Testing in the cloud, even with these considerations, is still the **best way** to guarantee the quality of your serverless solutions.

### Testing with mocks

Testing with mocks is a technique where you create replacement objects in your code to simulate the behavior of a cloud service.

For example, you could write a test that uses a mock of the Amazon S3 service that returns a specific response whenever the **CreateObject** method is called. When a test runs, the mock returns that programmed response without calling Amazon S3, or any other service endpoints.

Mock objects are often generated by a mock framework to reduce development effort. Some mock frameworks are generic and others are designed specifically for AWS SDKs, such as [Moto](https://pypi.org/project/moto/), a Python library for mocking AWS services and resources.

Note that mock objects differ from emulators in that mocks are typically created or configured by a developer as part of the test code, whereas emulators are standalone applications that expose functionality in the same manner as the systems they emulate.

The advantages of using mocks include the following:

*   Mocks can simulate third-party services that are beyond the control of your application, such as APIs and software as a service (SaaS) providers, without needing direct access to those services.
    
*   Mocks are useful for testing failure conditions, especially when such conditions are hard to simulate, like a service outage.
    
*   Mock can provide fast local testing once configured.
    
*   Mocks can provide substitute behavior for virtually any kind of object, so mocking strategies can create coverage for a wider variety of services than emulators.
    
*   When new features or behaviors become available, mock testing can react more quickly. By using a generic mock framework, you can simulate new features as soon as the updated AWS SDK become available.
    

Mock testing has these disadvantages:

*   Mocks generally require a non-trivial amount of setup and configuration effort, specifically when trying to determine return values from different services in order to properly mock responses.
    
*   Mocks are written, configured, and must be maintained by developers, increasing their responsibilities.
    
*   You might need to have access to the cloud in order to understand the APIs and return values of services.
    
*   Mocks can be difficult to maintain. When mocked cloud API signatures change, or return value schemas evolve, you need to update your mocks. Mocks also require updates if you extend your application logic to make calls to new APIs.
    
*   Tests that use mocks might pass in desktop environments but fail in the cloud. Results may not match the current API. Service configuration and quotas cannot be tested.
    
*   Mock frameworks are limited in testing or detecting AWS Identity and Access Management (IAM) policy or quota limitations. Although mocks are better at simulating when authorization fails or a quota is exceeded, testing cannot determine which outcome will actually occur in a production environment.
    

### Testing locally using AWS SAM CLI

Use AWS SAM CLI to [test your functions in Docker containers](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-invoke.html) using the same runtime environment as AWS Lambda. You can test function logic and event processing locally without deploying to the cloud. If your function makes API calls to other AWS services, those calls will reach real AWS resources.

The advantages of testing with local containers include the following:

*   Uses AWS Lambda runtime environments for accurate testing.
    
*   Enables fast local development iterations without cloud deployment.
    
*   Supports debugging with familiar local development tools.
    

Testing with local containers has these limitations:

*   AWS service calls from your function will interact with real AWS resources, which may incur costs and affect production data.
    
*   Requires Docker to be installed and running locally.
    

### Testing with emulation

Emulators are locally running applications that mimic AWS services by providing similar APIs and return values. LocalStack is a popular emulation tool that provides a complete local development environment for testing service integrations.

LocalStack is an AWS Cloud emulator that you can use to test serverless applications locally. You can test Lambda functions that integrate with services like DynamoDB, Amazon S3, and Amazon SQS without connecting to actual AWS services. You can use [LocalStack in the AWS Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/lambda-localstack.html).

The advantages of test with emulators include the following:

*   Emulators can facilitate fast local development iterations and testing.
    
*   Emulators provide a familiar environment for developers used to developing code in a local environment. For example, if you’re familiar with the development of an _n_\-tier application, you might have a database engine and web server, similar to those running in production, running on your local machine to provide quick, local, isolated test capability.
    
*   Emulators do not require any changes to cloud infrastructure (such as developer cloud accounts), so it’s easy to implement with existing testing patterns.
    
*   Because emulators don't use actual AWS resources, you won't get unexpected charges when starting multiple services or for letting some resources run for extended periods of time.
    

Testing with emulators has these disadvantages:

*   Emulators can be difficult to set up and replicate, especially when used in CI/CD pipelines. This can increase the workload of IT staff or developers who manage their own software.
    
*   Emulated features and APIs typically lag behind service updates. This can lead to errors because tested code does not match the actual API, and impede the adoption of new features.
    
*   Emulators require support, updates, bug fixes, and feature parity enhancements. These are the responsibility of the emulator author, which could be a third-party company.
    
*   Tests that rely on emulators may provide successful results locally, but fail in the cloud due to production security policies, inter-service configurations, or exceeding Lambda quotas.
    

Best practices


----------------

The following sections provide recommendations for successful serverless application testing.

You can find practical examples of tests and test automation in the [Serverless Test Samples repository](https://github.com/aws-samples/serverless-test-samples).

### Prioritize testing in the cloud

Testing in the cloud provides the most reliable, accurate, and complete test coverage. Performing tests in the context of the cloud will comprehensively test not only business logic but also security policies, service configurations, quotas, and the most up to date API signatures and return values.

### Structure your code for testability

Simplify your tests and Lambda functions by separating Lambda-specific code from your core business logic.

Your Lambda function _handler_ should be a slim adapter that takes in event data and passes only the details that matter to your business logic method(s). With this strategy, you can wrap comprehensive tests around your business logic without worrying about Lambda-specific details. Your AWS Lambda functions should not require setting up a complex environment or large amount of dependencies to create and initialize the component under test.

Generally speaking, you should write a handler that extracts and validates data from the incoming _event_ and _context_ objects, then sends that input to methods that perform your business logic.

### Accelerate development feedback loops

There are tools and techniques to accelerate development feedback loops. For example, [AWS SAM Accelerate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html) and [AWS CDK watch mode](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-deploy-watch) both decrease the time required to update cloud environments.

The samples in the GitHub [Serverless Test Samples repository](https://github.com/aws-samples/serverless-test-samples) explore some of these techniques.

We also recommend that you create and test cloud resources as early as possible during development—not only after a check-in to source control. This practice enables quicker exploration and experimentation when developing solutions. In addition, automating deployment from a development machine helps you discover cloud configuration problems more quickly and reduces wasted effort for updates and code review processes.

### Focus on integration tests

When building applications with Lambda, testing components together is a best practice.

Tests that run against two or more architectural components are called _integration tests_. The goal of integration tests is to understand not only how your code will execute across components, but how the environment hosting your code will behave. _End-to-end tests_ are special types of integration tests that verify behaviors across an entire application.

To build integration tests, deploy your application to a cloud environment. This can be done from a local environment or through a CI/CD pipeline. Then, write tests to exercise the system under test (SUT) and validate expected behavior.

For example, the system under test could be an application that uses API Gateway, Lambda and DynamoDB. A test could make a synthetic HTTP call to an API Gateway endpoint and validate that the response included the expected payload. This test validates that the AWS Lambda code is correct, and that each service is correctly configured to handle the request, including the IAM permissions between them. Further, you could design the test to write records of various sizes to verify your service quotas, such as max record size in DynamoDB, are set up correctly.

![Diagram showing a system under test comprised of three services.](/images/lambda/latest/dg/images/testing-system-under-test.png)

### Create isolated test environments

Testing in the cloud typically requires isolated developer environments, so that tests, data, and events do not overlap.

One approach is to provide each developer a dedicated AWS account. This will avoid conflicts with resource naming that can occur when multiple developers working in a shared code base, attempt to deploy resources or invoke an API.

Automated test processes should create uniquely named resources for each stack. For example, you can set up scripts or TOML configuration files so that AWS SAM CLI [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html) or [sam sync](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-sync.html) commands will automatically specify a stack with a unique prefix.

In some cases, developers share an AWS account. This may be due to having resources in your stack that are expensive to operate, or to provision and configure. For example, a database may be shared to make it easier to set up and seed the data properly

If developers share an account, you should set boundaries to identify ownership and eliminate overlap. One way to do this is by prefixing stack names with developer user IDs. Another popular approach is to set up stacks based on **code branches**. With branch boundaries, environments are isolated, but developers can still share resources, such as a relational database. This approach is a best practice when developers work on more than one branch at a time.

Testing in the cloud is valuable for all phases of testing, including unit tests, integration tests, and end-to-end tests. Maintaining proper isolation is essential; but you still want your QA environment to resemble your production environment as closely as possible. For this reason, teams add change control processes for QA environments.

For pre-production and production environments, boundaries are typically drawn at the account level to insulate workloads from noisy neighbor problems and implement least privilege security controls to protect sensitive data. Workloads have quotas. You don't want your testing to consume quotas allocated for production (noisy neighbor) or have access to customer data. Load testing is another activity you should isolate from your production stack.

In all cases, environments should be configured with alerts and controls to avoid unnecessary spending. For example, you can limit the type, tier, or size of resources that can be created, and set up email alerts when estimated costs exceed a given threshold.

### Use mocks for isolated business logic

Mock frameworks are a valuable tool for writing fast unit tests. They are especially beneficial when tests cover complex internal business logic, such as mathematical or financial calculations or simulations. Look for unit tests that have a large number of test cases or input variations, where those inputs do not change the pattern or the content of calls to other cloud services.

Code that is covered by unit tests with mocks should also be covered by testing in the cloud. This is recommended because a developer laptop or build machine environment could be configured differently than a production environment in the cloud. For example, your Lambda functions could use more memory or time than allocated when run with certain input parameters. Or your code might include environment variables that are not configured in the same way (or at all), and the differences could cause the code to behave differently or fail.

The benefit of mocks is less for integration tests, because the level of effort to implement the necessary mocks increases with the number of connection points. End-to-end testing should not use mocks, because these tests generally deal with states and complex logic that cannot be easily simulated with mock frameworks.

Lastly, avoid using mocked cloud services to validate the proper implementation of service calls. Instead, make cloud service calls in the cloud to validate behavior, configuration, and functional implementation.

### Use emulators sparingly

Emulators can be convenient for some use cases, for example, for a development team with limited, unreliable, or slow internet access. But, in most circumstances, choose to use emulators sparingly.

By avoiding emulators, you will be able to build and innovate with the latest service features and up to date APIs. You will not be stuck waiting on vendor releases to achieve feature parity. You will reduce your upfront and ongoing expenses for purchasing and configuration on multiple development systems and build machines. Moreover, you will avoid the problem that many cloud services simply do not have emulators available. A testing strategy that depends on emulation will make it impossible to use those services (leading to potentially more expensive workarounds) or produce code and configurations that aren’t well tested.

When you do use emulation for testing, you must still test in the cloud to verify configuration and to test interactions with cloud services that can only be simulated or mocked in an emulated environment.

Challenges testing locally


----------------------------

When you use emulators and mocked calls to test on your local desktop you might experience testing inconsistencies as your code progresses from environment to environment in your CI/CD pipeline. Unit tests to validate your application’s business logic on your desktop may not accurately test critical aspects of the cloud services.

The following examples provide cases to watch out for when testing locally with mocks and emulators:

### Example: Lambda function creates an S3 bucket

If a Lambda function’s logic depends on creating an S3 bucket, a complete test should confirm that Amazon S3 was called and the bucket was successfully created.

*   In a mock testing setup, you might mock a success response and potentially add a test case to handle a failure response.
    
*   In an emulation testing scenario, the **CreateBucket** API might be called, but you need to be aware that the identity making the local call will **not** originate from the Lambda service. The calling identity will not assume a security role as it would in the cloud, so a placeholder authentication will be used instead, possibly with a more permissive role or user identity that will be different when run in the cloud.
    

The mock and emulation setups will test what the Lambda function will do if it calls Amazon S3; however, those tests will not verify that the Lambda function, as configured, is capable of successfully creating the Amazon S3 bucket. You must make sure the role assigned to the function has an attached security policy that allows the function to perform the `s3:CreateBucket` action. If not, the function will likely fail when deployed to a cloud environment.

### Example: Lambda function processes messages from an Amazon SQS queue

If an Amazon SQS queue is the source of a Lambda function, a complete test should verify that the Lambda function is successfully invoked when a message is put in a queue.

Emulation testing and mock testing are generally set up to run the Lambda function code directly, and to simulate the Amazon SQS integration by passing a JSON event payload (or a deserialized object) as the function handler’s input.

Local testing that simulates the Amazon SQS integration will test what the Lambda function will do when it’s called by Amazon SQS with a given payload, but the test will not verify that Amazon SQS will successfully invoke the Lambda function when it is deployed to a cloud environment.

Some examples of configuration problems you might encounter with Amazon SQS and Lambda include the following:

*   Amazon SQS visibility timeout is too low, resulting in multiple invocations when only one was intended.
    
*   The Lambda function’s execution role doesn’t allow reading messages from the queue (through `sqs:ReceiveMessage`, `sqs:DeleteMessage`, or`sqs:GetQueueAttributes`).
    
*   The sample event that is passed to the Lambda function exceeds the Amazon SQS message size quota. Therefore, the test is invalid because Amazon SQS would never be able to send a message of that size.
    

As these examples show, tests that cover business logic but not the configurations between cloud services are likely to provide unreliable results.

FAQ


-----

**I have a Lambda function that performs calculations and returns a result without calling any other services. Do I really need to test it in the cloud?**

Yes. Lambda functions have configuration parameters that could change the outcome of the test. All Lambda function code has a dependency on [timeout](./configuration-timeout.html) and [memory](./configuration-memory.html) settings, which could cause the function to fail if those settings are not set properly. Lambda policies also enable standard output logging to [Amazon CloudWatch](http://aws.amazon.com/cloudwatch/). Even if your code does not call CloudWatch directly, permission is needed to enable logging. This required permission cannot be accurately mocked or emulated.

**How can testing in the cloud help with unit testing? If it’s in the cloud and connects to other resources, isn’t that an integration test?**

We define _unit tests_ as tests that operate on architectural components in isolation, but this does not prevent tests from including components that may call other services or use some network communication.

Many serverless applications have architectural components that can be tested in isolation, even in the cloud. One example is a Lambda function that takes input, processes the data, and sends a message to an Amazon SQS queue. A unit test of this function would likely test whether input values result in certain values being present in the queued message.

Consider a test that is written by using the Arrange, Act, Assert pattern:

*   _Arrange_: Allocate resources (a queue to receive messages, and the function under test).
    
*   _Act_: Call the function under test.
    
*   _Assert_: Retrieve the message sent by the function, and validate the output.
    

A mock testing approach would involve mocking the queue with an in-process mock object, and creating an in-process instance of the class or module that contains the Lambda function code. During the Assert phase, the queued message would be retrieved from the mocked object.

In a cloud-based approach, the test would create an Amazon SQS queue for the purposes of the test, and would deploy the Lambda function with environment variables that are configured to use the isolated Amazon SQS queue as the output destination. After running the Lambda function, the test would retrieve the message from the Amazon SQS queue.

The cloud-based test would run the same code, assert the same behavior, and validate the application’s functional correctness. However, it would have the added advantage of being able to validate the settings of the Lambda function: the IAM role, IAM policies, and the function’s timeout and memory settings.

Next steps and resources


--------------------------

Use the following resources to learn more and explore practical examples of testing.

**Sample implementations**

The [Serverless Test Samples repository](https://github.com/aws-samples/serverless-test-samples) on GitHub contains concrete examples of tests that follow the patterns and best practices described in this guide. The repository contains sample code and guided walkthroughs of the mock, emulation, and cloud testing processes described in previous sections. Use this repository to get up to speed on the latest serverless testing guidance from AWS.

**Further reading**

Visit [Serverless Land](https://serverlessland.com/) to access the latest blogs, videos, and training for AWS serverless technologies.

The following AWS blog posts are also recommended reading:

*   [Accelerating serverless development with AWS SAM Accelerate](https://aws.amazon.com/blogs/compute/accelerating-serverless-development-with-aws-sam-accelerate/) (AWS blog post)
    
*   [Increasing development speed with CDK Watch](https://aws.amazon.com/blogs/developer/increasing-development-speed-with-cdk-watch/) (AWS blog post)
    
*   [Mocking service integrations with AWS Step Functions Local](https://aws.amazon.com/blogs/compute/mocking-service-integrations-with-aws-step-functions-local/) (AWS blog post)
    
*   [Getting started with testing serverless applications](https://aws.amazon.com/blogs/compute/getting-started-with-testing-serverless-applications/) (AWS blog post)
    

**Tools**

*   AWS SAM – [Testing and debugging serverless applications](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-test-and-debug.html)
    
*   AWS SAM – [Integrating with automated tests](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-automated-tests.html)
    
*   Lambda – [Testing Lambda functions in the Lambda console](./testing-functions.html)