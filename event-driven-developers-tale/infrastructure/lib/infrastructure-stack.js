const cdk = require('@aws-cdk/core');
const eventbridge = require('@aws-cdk/aws-events');
const targets = require('@aws-cdk/aws-events-targets');
const lambda = require('@aws-cdk/aws-lambda');
const iam = require('@aws-cdk/aws-iam');
const assets = require('@aws-cdk/aws-s3-assets');
const { Duration } = require('@aws-cdk/core');

class InfrastructureStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // GLOBAL ENVIRONMENT VARIABLES
    // !!!!
    // REPLACE WITH YOUR OWN VALUES AFTER AMPLIFY PUSH
    // !!!!
    //
    var TableNameEnv = "VacationRequest-ckp2905llfbhvp3rzplgpjpocm-twitch"; // this is just an example. not a real value.
    var appSyncEndpointEnv = "https://5lex5fzaciqulcx4d5h67xgyz4.appsync-api.eu-west-1.amazonaws.com/graphql"; // this is just an example. not a real value.


    var evb = new eventbridge.EventBus(this, "VacationTrackerEventBus", {
      eventBusName: "VacationTrackerEvents"
    });

    var dynamoPolicyStatement = new iam.PolicyStatement({
      actions: [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:ConditionCheckItem",
        "dynamodb:PutItem",
        "dynamodb:DescribeTable",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      resources: ["*"],
      effect: iam.Effect.ALLOW
    });

    var cloudwatchLogsStatement = new iam.PolicyStatement({
      actions: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ],
      resources: ["*"],
      effect: iam.Effect.ALLOW
    });

    var EventableRole = new iam.Role(this, "dynamoAndEventBridgePutRole", {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEventBridgeFullAccess")
      ],
      inlinePolicies: [
        new iam.PolicyDocument({
          statements: [
            dynamoPolicyStatement,
            cloudwatchLogsStatement
          ]
        })
      ]
    });    

    var appSyncStatement = new iam.PolicyStatement({
      actions: [
        "appsync:*"
      ],
      resources: ["*"],
      effect: iam.Effect.ALLOW
    });

    var AppSyncIntegrationRole = new iam.Role(this, "appSyncIntegrationRole", {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess")
      ],
      inlinePolicies: [
        new iam.PolicyDocument({
          statements: [
            appSyncStatement,
            cloudwatchLogsStatement
          ]
        })
      ]
    });

    const createVacationRequestAsset = new assets.Asset(this, 'createVacationRequestBundledAsset', {
      path: '../functions/createVacationRequest/'
    });

    const updateVacationRequestAsset = new assets.Asset(this, 'updateVacationRequestBundledAsset', {
      path: '../functions/updateVacationRequest/'
    });

    const validateVacationRequestAsset = new assets.Asset(this, 'vacationRequestValidationBundledAsset', {
      path: '../functions/vacationRequestValidation/'
    });

    var createVacationRequestFunction = new lambda.Function(this, "createVacationRequestFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'app.handler',
      code: lambda.Code.fromBucket(createVacationRequestAsset.bucket, createVacationRequestAsset.s3ObjectKey),
      role: EventableRole,
      functionName: "createVacationRequestFunction",
      environment: {
        "TABLE_NAME": TableNameEnv,
        "EVENT_BUS_NAME": evb.eventBusName
      },
      tracing: lambda.Tracing.ACTIVE,
      timeout: Duration.seconds(15),
      memorySize: 512   
    });

    var updateVacationRequestFunction = new lambda.Function(this, "updateVacationRequestFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'app.handler',
      code: lambda.Code.fromBucket(updateVacationRequestAsset.bucket, updateVacationRequestAsset.s3ObjectKey),
      role: EventableRole,
      functionName: "updateVacationRequestFunction",
      environment: {
        "TABLE_NAME": TableNameEnv,
        "EVENT_BUS_NAME": evb.eventBusName
      },
      tracing: lambda.Tracing.ACTIVE,
      timeout: Duration.seconds(15),
      memorySize: 512
    });

    var validateVacationRequestFunction = new lambda.Function(this, "validateVacationRequestFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'app.handler',
      code: lambda.Code.fromBucket(validateVacationRequestAsset.bucket, validateVacationRequestAsset.s3ObjectKey),
      role: AppSyncIntegrationRole,
      functionName: "validateVacationRequestFunction",
      environment: {
        "APP_SYNC_API_URL": appSyncEndpointEnv
      },
      tracing: lambda.Tracing.ACTIVE,
      timeout: Duration.seconds(15),
      memorySize: 512
    });

    var vacationRequestSubmitedRule = new eventbridge.Rule(this, "ValidateVacationRequestOnSubmission", {
      enabled: true,
      eventBus: evb,
      ruleName: "ValidateVacationRequestOnSubmission",
      eventPattern: {
        source: ["VacationTrackerApp"],
        detailType: ["VacationRequestSubmited"]
      },
      targets: [
        new targets.LambdaFunction(validateVacationRequestFunction)
      ]
    });


    var vacationRequestValidatedRule = new eventbridge.Rule(this, "VacationRequestValidated", {
      enabled: true,
      eventBus: evb,
      ruleName: "VacationRequestValidated",
      eventPattern: {
        source: ["VacationTrackerApp"],
        detailType: ["VacationRequestValidated"]
      }
    });

    var vacationRequestApprovedRule = new eventbridge.Rule(this, "VacationRequestApproved", {
      enabled: true,
      eventBus: evb,
      ruleName: "VacationRequestApproved",
      eventPattern: {
        source: ["VacationTrackerApp"],
        detailType: ["VacationRequestApproved"]
      } 
    });

  }
}

module.exports = { InfrastructureStack }
