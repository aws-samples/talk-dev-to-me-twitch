import * as cdk from '@aws-cdk/core';
import {
    CfnApplication,
    CfnConfigurationProfile, CfnDeployment, CfnDeploymentStrategy,
    CfnEnvironment,
    CfnHostedConfigurationVersion
} from "@aws-cdk/aws-appconfig";

export class CdkStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const app = new CfnApplication(this, "app", {name: "productapp"});

        const env = new CfnEnvironment(this, "env", {
            applicationId: app.ref,
            name: "dev-env"
        });

        const configProfile = new CfnConfigurationProfile(this, "profile", {
            applicationId: app.ref,
            locationUri: "hosted",
            name: "configProfile"
        });


        const featureConfig = {
            "premium_features": {
                "default": false,
                "rules": {
                    "customer tier equals premium": {
                        "when_match": true,
                        "conditions": [
                            {
                                "action": "EQUALS",
                                "key": "tier",
                                "value": "premium"
                            }
                        ]
                    }
                }
            },
            "discount": {
                "default": true
            }
        }

        const hostedConfigVersion = new CfnHostedConfigurationVersion(this, "version", {
            applicationId: app.ref,
            configurationProfileId: configProfile.ref,
            content: JSON.stringify(featureConfig),
            contentType: "application/json"


        });

        const appConfigDeploymentStrategy = new CfnDeploymentStrategy(this, "strategy", {
            deploymentDurationInMinutes: 0,
            growthFactor: 100,
            name: "Instant",
            replicateTo: "NONE",
        });

        new CfnDeployment(this, "deploy", {
            applicationId: app.ref,
            configurationProfileId: configProfile.ref,
            configurationVersion: hostedConfigVersion.ref,
            deploymentStrategyId: appConfigDeploymentStrategy.ref,
            environmentId: env.ref

        });
    }


}
