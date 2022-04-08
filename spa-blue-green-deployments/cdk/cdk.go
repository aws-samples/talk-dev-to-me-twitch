package main

import (
	"fmt"
	"strings"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscertificatemanager"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfront"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfrontorigins"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudwatch"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscodebuild"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscodepipeline"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscodepipelineactions"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsssm"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsstepfunctions"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsstepfunctionstasks"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

const cloudFrontFunctionTemplate = `
function handler(event) {
  var request = event.request

  // Check whether the URI is missing a file name.
  if (request.uri.endsWith("/")) {
    request.uri = "/index.html"
  }

  // Check whether the URI is missing a file extension
  else if (!request.uri.includes(".")) {
    request.uri = "/index.html"
  }

  // Prefix the URI with the version.
  request.uri = "/%%%%" + request.uri

  return request
}
`

// Create a GitHub secret in advance and store it on "MyGitHubSecret" secret
var githubSecret = awscdk.SecretValue_SecretsManager(jsii.String("MyGitHubSecret"), &awscdk.SecretsManagerSecretOptions{
	JsonField: jsii.String("token"),
})

type CloudFrontSPAStackProps struct {
	awscdk.StackProps

	DomainName   string
	DefaultTTL   int
	MinimumTTL   int
	PriceClass   awscloudfront.PriceClass
	GitHubOwner  string
	GitHubRepo   string
	GitHubBranch string
}

func NewCloudFrontSPAStack(scope constructs.Construct, id string, props *CloudFrontSPAStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	// CloudFront Access Origin ID
	accessOrigin := awscloudfront.NewOriginAccessIdentity(stack, jsii.String("OriginAccessIdentity"), &awscloudfront.OriginAccessIdentityProps{
		Comment: jsii.String("Allow CloudFront to access S3"),
	})

	// Bucket that will old the SPA files
	siteBucket := awss3.NewBucket(stack, jsii.String("SiteBucket"), &awss3.BucketProps{
		AutoDeleteObjects: jsii.Bool(true),
		RemovalPolicy:     awscdk.RemovalPolicy_DESTROY,
	})

	// Allow CloudFront to access this private S3 Bucket
	siteBucket.AddToResourcePolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Effect:    awsiam.Effect_ALLOW,
		Actions:   jsii.Strings("s3:GetObject"),
		Resources: jsii.Strings(fmt.Sprintf("arn:aws:s3:::%s/*", *siteBucket.BucketName())),
		Principals: &[]awsiam.IPrincipal{
			awsiam.NewCanonicalUserPrincipal(accessOrigin.CloudFrontOriginAccessIdentityS3CanonicalUserId()),
		},
	}))

	// Certificate
	certificate := awscertificatemanager.NewCertificate(stack, jsii.String("Certificate"), &awscertificatemanager.CertificateProps{
		DomainName: jsii.String(props.DomainName),
		Validation: awscertificatemanager.CertificateValidation_FromEmail(nil),
	})

	// CloudFront cache policy
	cloudFrontCachePolicy := awscloudfront.NewCachePolicy(stack, jsii.String("CloudFrontCachePolicy"), &awscloudfront.CachePolicyProps{
		CookieBehavior:             awscloudfront.CacheCookieBehavior_None(),
		DefaultTtl:                 awscdk.Duration_Seconds(jsii.Number(float64(props.DefaultTTL))),
		MinTtl:                     awscdk.Duration_Seconds(jsii.Number(float64(props.MinimumTTL))),
		EnableAcceptEncodingBrotli: jsii.Bool(true),
		EnableAcceptEncodingGzip:   jsii.Bool(true),
		QueryStringBehavior:        awscloudfront.CacheQueryStringBehavior_None(),
	})

	// Create a CloudFront function with a dummy function to start with
	cloudFrontFunction := awscloudfront.NewFunction(stack, jsii.String("CloudFrontFunction"), &awscloudfront.FunctionProps{
		Code: awscloudfront.FunctionCode_FromInline(jsii.String(`
		  function handler(event) {
				var request = event.request;
				return request;
			}
		`)),
		Comment: jsii.String("Send the traffic to the specific backend prefix"),
	})

	// CloudFront distribution
	distribution := awscloudfront.NewDistribution(stack, jsii.String("CloudFrontDistrubtion"), &awscloudfront.DistributionProps{
		DomainNames:       jsii.Strings(props.DomainName),
		Certificate:       certificate,
		DefaultRootObject: jsii.String("index.html"),
		PriceClass:        props.PriceClass,
		HttpVersion:       awscloudfront.HttpVersion_HTTP2,
		DefaultBehavior: &awscloudfront.BehaviorOptions{
			Origin: awscloudfrontorigins.NewS3Origin(siteBucket, &awscloudfrontorigins.S3OriginProps{
				OriginAccessIdentity: accessOrigin,
			}),
			Compress:              jsii.Bool(true),
			CachePolicy:           cloudFrontCachePolicy,
			AllowedMethods:        awscloudfront.AllowedMethods_ALLOW_GET_HEAD(),
			ViewerProtocolPolicy:  awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
			ResponseHeadersPolicy: awscloudfront.ResponseHeadersPolicy_SECURITY_HEADERS(),
			FunctionAssociations: &[]*awscloudfront.FunctionAssociation{
				{
					EventType: awscloudfront.FunctionEventType_VIEWER_REQUEST,
					Function:  cloudFrontFunction,
				},
			},
		},
	})

	// Blue/Green deployer

	// Website version parameter
	websiteVersionParameter := awsssm.NewStringParameter(stack, jsii.String("WebsiteVersionParamter"), &awsssm.StringParameterProps{
		StringValue: jsii.String("genesis"),
	})

	// Metric/Alarm that represents website being healthy
	websiteHealthyMetric := awscloudwatch.NewMetric(&awscloudwatch.MetricProps{
		Unit:       awscloudwatch.Unit_NONE,
		MetricName: jsii.String("WebsiteHealthiness"),
		Namespace:  jsii.String("CloudFrontSPA"),
	})

	websiteAlarm := websiteHealthyMetric.CreateAlarm(stack, jsii.String("WebsiteAlarm"), &awscloudwatch.CreateAlarmOptions{
		EvaluationPeriods:  jsii.Number(1),
		Threshold:          jsii.Number(1),
		ComparisonOperator: awscloudwatch.ComparisonOperator_GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
		TreatMissingData:   awscloudwatch.TreatMissingData_IGNORE,
	})

	// Lambda to increment conter
	counterIncrementerFunction := awslambda.NewFunction(stack, jsii.String("CounterIncrementer"), &awslambda.FunctionProps{
		Handler: jsii.String("index.handler"),
		Code: awslambda.AssetCode_FromInline(jsii.String(`
exports.handler = function iterator (event, context, callback) {
  let index = event.iterator.index
  let step = event.iterator.step
  let count = event.iterator.count
 
  index = index + step
 
  callback(null, {
    index,
    step,
    count,
    continue: index < count
  })
}`)),
		Runtime:      awslambda.Runtime_NODEJS_14_X(),
		Architecture: awslambda.Architecture_ARM_64(),
	})

	// CodePipeline to connects Github + CodeBuild + Step Functions
	createTemplateStep := awsstepfunctions.NewPass(stack, jsii.String("CreateTemplate"), &awsstepfunctions.PassProps{
		Comment: jsii.String("Creates a CloudFront Function from a template and a version number"),
		Parameters: &map[string]interface{}{
			"FunctionCode": awsstepfunctions.JsonPath_Format(
				awsstepfunctions.JsonPath_StringAt(jsii.String("$.FunctionCode")),
				awsstepfunctions.JsonPath_StringAt(jsii.String("$.Version")),
			),
		},
		ResultPath: jsii.String("$.template"),
	})

	describeFunctionStep := awsstepfunctions.NewCustomState(stack, jsii.String("DescribeFunction"), &awsstepfunctions.CustomStateProps{
		StateJson: &map[string]interface{}{
			"Type":     "Task",
			"Resource": "arn:aws:states:::aws-sdk:cloudfront:describeFunction",
			"Parameters": map[string]interface{}{
				"Name": cloudFrontFunction.FunctionName(),
			},
			"ResultSelector": map[string]string{
				"FunctionETag.$": "$.ETag",
			},
			"ResultPath": "$.result",
		},
	})

	updateFunctionStep := awsstepfunctions.NewCustomState(stack, jsii.String("UpdateFunction"), &awsstepfunctions.CustomStateProps{
		StateJson: &map[string]interface{}{
			"Type":     "Task",
			"Resource": "arn:aws:states:::aws-sdk:cloudfront:updateFunction",
			"Parameters": map[string]interface{}{
				"FunctionCode.$": "$.template.FunctionCode",
				"FunctionConfig": map[string]string{
					"Comment.$": "$.Version",
					"Runtime":   "cloudfront-js-1.0",
				},
				"IfMatch.$": "$.result.FunctionETag",
				"Name":      cloudFrontFunction.FunctionName(),
			},
			"ResultPath": "$.result",
			"ResultSelector": &map[string]string{
				"FunctionETag.$": "$.ETag",
			},
		},
	})

	publishFunctionStep := awsstepfunctions.NewCustomState(stack, jsii.String("PublishFunction"), &awsstepfunctions.CustomStateProps{
		StateJson: &map[string]interface{}{
			"Type":     "Task",
			"Resource": "arn:aws:states:::aws-sdk:cloudfront:publishFunction",
			"Parameters": map[string]interface{}{
				"IfMatch.$": "$.result.FunctionETag",
				"Name":      cloudFrontFunction.FunctionName(),
			},
			"ResultPath": "$.result",
		},
	})

	getDistributionStatusStep := awsstepfunctions.NewCustomState(stack, jsii.String("GetDistributionState"), &awsstepfunctions.CustomStateProps{
		StateJson: &map[string]interface{}{
			"Type":     "Task",
			"Resource": "arn:aws:states:::aws-sdk:cloudfront:getDistribution",
			"Parameters": map[string]interface{}{
				"Id": distribution.DistributionId(),
			},
			"ResultPath": "$.result",
		},
	})

	waitForDistributionStep := awsstepfunctions.NewWait(stack, jsii.String("WaitForDistribution"), &awsstepfunctions.WaitProps{
		Time: awsstepfunctions.WaitTime_Duration(awscdk.Duration_Seconds(jsii.Number(2))),
	})

	initializeTriesStep := awsstepfunctions.NewPass(stack, jsii.String("InitializeTries"), &awsstepfunctions.PassProps{
		Result: awsstepfunctions.NewResult(map[string]int{
			"count": 10,
			"index": 0,
			"step":  1,
		}),
		ResultPath: jsii.String("$.iterator"),
	})

	iteratorStep := awsstepfunctionstasks.NewLambdaInvoke(stack, jsii.String("Iterator"), &awsstepfunctionstasks.LambdaInvokeProps{
		LambdaFunction: counterIncrementerFunction,
		Payload:        awsstepfunctions.TaskInput_FromJsonPathAt(jsii.String("$")),
		ResultPath:     jsii.String("$.iterator"),
		ResultSelector: &map[string]interface{}{
			"index.$":    "$.Payload.index",
			"step.$":     "$.Payload.step",
			"count.$":    "$.Payload.count",
			"continue.$": "$.Payload.continue",
		},
		RetryOnServiceExceptions: jsii.Bool(true),
	})

	waitStep := awsstepfunctions.NewWait(stack, jsii.String("Wait"), &awsstepfunctions.WaitProps{
		Time: awsstepfunctions.WaitTime_Duration(awscdk.Duration_Seconds(jsii.Number(10))),
	})

	describeAlarmsStep := awsstepfunctions.NewCustomState(stack, jsii.String("DescribeAlarms"), &awsstepfunctions.CustomStateProps{
		StateJson: &map[string]interface{}{
			"Type":     "Task",
			"Resource": "arn:aws:states:::aws-sdk:cloudwatch:describeAlarms",
			"Parameters": map[string]interface{}{
				"AlarmNames": []*string{
					websiteAlarm.AlarmName(),
				},
			},
			"ResultPath": jsii.String("$.result"),
		},
	})

	putVersionStep := awsstepfunctions.NewCustomState(stack, jsii.String("PutVersion"), &awsstepfunctions.CustomStateProps{
		StateJson: &map[string]interface{}{
			"Type":     "Task",
			"Resource": "arn:aws:states:::aws-sdk:ssm:putParameter",
			"Parameters": map[string]interface{}{
				"Name":      websiteVersionParameter.ParameterName(),
				"Value.$":   "$.Version",
				"Overwrite": true,
			},
		},
	})

	getVersionStep := awsstepfunctions.NewCustomState(stack, jsii.String("GetVersion"), &awsstepfunctions.CustomStateProps{
		StateJson: &map[string]interface{}{
			"Type":     "Task",
			"Resource": "arn:aws:states:::aws-sdk:ssm:getParameter",
			"Parameters": map[string]interface{}{
				"Name": websiteVersionParameter.ParameterName(),
			},
			"ResultPath": jsii.String("$.result"),
			"ResultSelector": map[string]interface{}{
				"Version.$": "$.Parameter.Value",
				"Rollback":  true,
			},
		},
	})

	prepareStateStep := awsstepfunctions.NewPass(stack, jsii.String("PrepareState"), &awsstepfunctions.PassProps{
		Parameters: &map[string]interface{}{
			"FunctionCode.$": "$.FunctionCode",
			"Version.$":      "$.result.Version",
			"Rollback":       true,
		},
	})

	failStep := awsstepfunctions.NewFail(stack, jsii.String("Fail"), &awsstepfunctions.FailProps{
		Cause: jsii.String("Rolledback during deployment"),
	})

	successStep := awsstepfunctions.NewSucceed(stack, jsii.String("Success"), nil)

	workflow := createTemplateStep.
		Next(describeFunctionStep).
		Next(updateFunctionStep).
		Next(publishFunctionStep).
		Next(getDistributionStatusStep).
		Next(
			awsstepfunctions.NewChoice(stack, jsii.String("DistributionDeployed"), nil).
				When(awsstepfunctions.Condition_Not(awsstepfunctions.Condition_StringEquals(jsii.String("$.result.Distribution.Status"), jsii.String("Deployed"))),
					waitForDistributionStep.Next(getDistributionStatusStep),
				).
				Otherwise(
					awsstepfunctions.NewChoice(stack, jsii.String("IsRollback"), nil).
						When(awsstepfunctions.Condition_IsPresent(jsii.String("$.Rollback")), failStep).
						Otherwise(
							initializeTriesStep.
								Next(iteratorStep).
								Next(
									awsstepfunctions.NewChoice(stack, jsii.String("IsCountReached"), nil).
										When(awsstepfunctions.Condition_BooleanEquals(jsii.String("$.iterator.continue"), jsii.Bool(true)),
											waitStep.
												Next(describeAlarmsStep).
												Next(awsstepfunctions.NewChoice(stack, jsii.String("IsAlarmError"), nil).
													When(awsstepfunctions.Condition_StringEquals(jsii.String("$.result.MetricAlarms[0].StateValue"), jsii.String("ALARM")),
														getVersionStep.
															Next(prepareStateStep).
															Next(createTemplateStep),
													).
													Otherwise(iteratorStep),
												),
										).
										Otherwise(putVersionStep.Next(successStep)),
								),
						),
				),
		)

	blueGreenStateMachine := awsstepfunctions.NewStateMachine(stack, jsii.String("BlueGreenStateMachine"), &awsstepfunctions.StateMachineProps{
		Definition:       workflow,
		StateMachineType: awsstepfunctions.StateMachineType_STANDARD,
		Timeout:          awscdk.Duration_Minutes(jsii.Number(5)),
	})

	blueGreenStateMachine.AddToRolePolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Effect:    awsiam.Effect_ALLOW,
		Resources: &[]*string{jsii.String(fmt.Sprintf("arn:aws:cloudfront::%s:distribution/%s", *stack.Account(), *distribution.DistributionId()))},
		Actions: jsii.Strings(
			"cloudfront:GetDistribution",
		),
	}))

	blueGreenStateMachine.AddToRolePolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Effect:    awsiam.Effect_ALLOW,
		Resources: &[]*string{cloudFrontFunction.FunctionArn()},
		Actions: jsii.Strings(
			"cloudfront:DescribeFunction",
			"cloudfront:UpdateFunction",
			"cloudfront:PublishFunction",
		),
	}))

	blueGreenStateMachine.AddToRolePolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Effect:    awsiam.Effect_ALLOW,
		Resources: &[]*string{websiteAlarm.AlarmArn()},
		Actions:   jsii.Strings("cloudwatch:DescribeAlarms"),
	}))

	websiteVersionParameter.GrantWrite(blueGreenStateMachine)
	websiteVersionParameter.GrantRead(blueGreenStateMachine)

	// Bucket for codepipeline artifacts
	codepipelineBucket := awss3.NewBucket(stack, jsii.String("CodePipelineBucket"), &awss3.BucketProps{
		AutoDeleteObjects: jsii.Bool(true),
		RemovalPolicy:     awscdk.RemovalPolicy_DESTROY,
	})

	// CodeBuild project
	frontendCodeBuild := awscodebuild.NewPipelineProject(stack, jsii.String("FrontendCodeBuild"), &awscodebuild.PipelineProjectProps{
		Environment: &awscodebuild.BuildEnvironment{
			ComputeType: awscodebuild.ComputeType_LARGE,
			BuildImage:  awscodebuild.LinuxBuildImage_STANDARD_5_0(),
		},
		EnvironmentVariables: &map[string]*awscodebuild.BuildEnvironmentVariable{
			"DESTINATION_S3_BUCKET": {
				Type:  awscodebuild.BuildEnvironmentVariableType_PLAINTEXT,
				Value: siteBucket.BucketName(),
			},
		},
		BuildSpec: awscodebuild.BuildSpec_FromSourceFilename(jsii.String("app/buildspec.yml")),
		Cache: awscodebuild.Cache_Local(
			awscodebuild.LocalCacheMode_SOURCE,
			awscodebuild.LocalCacheMode_CUSTOM,
		),
	})
	siteBucket.GrantReadWrite(frontendCodeBuild, nil)
	siteBucket.GrantDelete(frontendCodeBuild, nil)
	codepipelineBucket.GrantReadWrite(frontendCodeBuild, nil)
	codepipelineBucket.GrantDelete(frontendCodeBuild, nil)

	// CodePipeline project
	awscodepipeline.NewPipeline(stack, jsii.String("CodePipeline"), &awscodepipeline.PipelineProps{
		ArtifactBucket:           codepipelineBucket,
		RestartExecutionOnUpdate: jsii.Bool(false),
		Stages: &[]*awscodepipeline.StageProps{
			{
				StageName: jsii.String("SourceFromGithub"),
				Actions: &[]awscodepipeline.IAction{
					awscodepipelineactions.NewGitHubSourceAction(&awscodepipelineactions.GitHubSourceActionProps{
						ActionName:         jsii.String("SourceAction"),
						OauthToken:         githubSecret,
						Owner:              jsii.String(props.GitHubOwner),
						Repo:               jsii.String(props.GitHubRepo),
						Branch:             jsii.String(props.GitHubBranch),
						Trigger:            awscodepipelineactions.GitHubTrigger_WEBHOOK,
						Output:             awscodepipeline.Artifact_Artifact(jsii.String("SiteSource")),
						VariablesNamespace: jsii.String("SourceVariables"),
						RunOrder:           jsii.Number(1),
					}),
				},
			},
			{
				StageName: jsii.String("Build"),
				Actions: &[]awscodepipeline.IAction{
					awscodepipelineactions.NewCodeBuildAction(&awscodepipelineactions.CodeBuildActionProps{
						ActionName: jsii.String("AngularBuild"),
						RunOrder:   jsii.Number(1),
						Input:      awscodepipeline.Artifact_Artifact(jsii.String("SiteSource")),
						Outputs: &[]awscodepipeline.Artifact{
							awscodepipeline.Artifact_Artifact(jsii.String("StaticFiles")),
						},
						Project: frontendCodeBuild,
						Type:    awscodepipelineactions.CodeBuildActionType_BUILD,
					}),
				},
			},
			{
				StageName: jsii.String("Deploy"),
				Actions: &[]awscodepipeline.IAction{
					awscodepipelineactions.NewStepFunctionInvokeAction(&awscodepipelineactions.StepFunctionsInvokeActionProps{
						ActionName:   jsii.String("BlueGreen"),
						RunOrder:     jsii.Number(1),
						Role:         nil,
						StateMachine: blueGreenStateMachine,
						StateMachineInput: awscodepipelineactions.StateMachineInput_Literal(&map[string]interface{}{
							"FunctionCode": escapeCloudFrontFunctionTemplate(cloudFrontFunctionTemplate),
							"Version":      "#{SourceVariables.CommitId}",
						}),
					}),
				},
			},
		},
	})

	return stack
}

func main() {
	app := awscdk.NewApp(nil)

	NewCloudFrontSPAStack(app, "CloudFrontSPAStack", &CloudFrontSPAStackProps{
		StackProps: awscdk.StackProps{
			Env: env(),
		},
		DomainName:   "cloudfront.example.com",
		DefaultTTL:   360000,
		MinimumTTL:   3600,
		PriceClass:   awscloudfront.PriceClass_PRICE_CLASS_ALL,
		GitHubOwner:  "rubenfonseca",
		GitHubRepo:   "cloudfront-demo",
		GitHubBranch: "main",
	})

	app.Synth(nil)
}

func env() *awscdk.Environment {
	return &awscdk.Environment{
		// We use us-east-1 because we can't easily use ACM Certificates with distributions outside us-east-1
		Region: jsii.String("us-east-1"),
	}
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-intrinsic-functions.html#amazon-states-language-intrinsic-functions-escapes
func escapeCloudFrontFunctionTemplate(input string) string {
	input = strings.ReplaceAll(input, "\\", "\\\\")
	input = strings.ReplaceAll(input, "'", "\\'")
	input = strings.ReplaceAll(input, "{", "\\{")
	input = strings.ReplaceAll(input, "}", "\\}")
	return strings.ReplaceAll(input, "%%%%", "{}")
}
