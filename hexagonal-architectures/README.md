# Serverless Typescript Demo

This is a simple serverless application built in Typescript and uses Node.js runtime. It consists of an [Amazon API Gateway](https://aws.amazon.com/api-gateway/) backed by four [AWS Lambda](https://aws.amazon.com/lambda/)
functions and an [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) table for storage.

<p align="center">
  <img src="images/diagram.png" alt="Architecture diagram"/>
</p>

We will explore the usage of [hexagonal architecture](https://www.youtube.com/watch?v=kRFg6fkVChQ) pattern to decouple the entry points, from the main domain logic and the storage logic. As an example we will see how to have multiple adapters and easily switch between them.

![hexagonal architecture diagram](images/hex.png)

## Requirements

- [AWS CLI](https://aws.amazon.com/cli/)
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Node.js 14](https://nodejs.org/)

### Deployment

Deploy the demo to your AWS account using [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html).

```bash
npm install
npm run build
# sam deploy --guided # if running for the first time. 
sam deploy
```

The `npm run build` commmand will first build the products TypeScript project. Then the command `sam deploy` use the SAM Template to deploy the resources to your account.

SAM will create an output of the API Gateway endpoint URL for future use in our load tests.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
