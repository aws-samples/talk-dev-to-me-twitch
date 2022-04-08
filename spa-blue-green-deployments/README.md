# SPA blue/green deployment on AWS

This repository has a demo on how to deploy a SPA (Angular) using CodePipeline, CodeBuild and
a custom Step Functions that does Blue/Green Deployment.

The IaC was written using [AWS CDK for Go](https://aws.amazon.com/blogs/developer/getting-started-with-the-aws-cloud-development-kit-and-go/).

**NOTICE**: Go support is still in Developer Preview. This implies that APIs may
change while we address early feedback from the community. We would love to hear
about your experience through GitHub issues.

## Structure

- `app`: the sample Angular application
- `cdk`: the IaC project written in Go