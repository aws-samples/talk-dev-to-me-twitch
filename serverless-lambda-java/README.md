# Serverless AWS Lambda with Java

In this session Melina Schweizer, Senior Specialist Solutions Architect at AWS, will walk us through Java development on AWS Lambda.

## AWS Lambda and Java best pratices

- reduce deployment and coldstarts by avoidigin heavy frameworks like spring an hibernate
- reuse resources during multiple invocations by moving the initiaisation outside of the main handler
- make your code more testable by moving the business logic outside of the handler

## Resources and Links

- [https://medium.com/i-love-my-local-farmer-engineering-blog](https://medium.com/i-love-my-local-farmer-engineering-blog)
- [https://github.com/aws-samples/i-love-my-local-farmer](https://github.com/aws-samples/i-love-my-local-farmer)
- [https://medium.com/i-love-my-local-farmer-engineering-blog/how-to-use-java-in-your-db-connected-aws-lambdas-211c1f9c53aa](https://medium.com/i-love-my-local-farmer-engineering-blog/how-to-use-java-in-your-db-connected-aws-lambdas-211c1f9c53aa)
- [https://docs.aws.amazon.com/lambda/latest/dg/lambda-java.html](https://docs.aws.amazon.com/lambda/latest/dg/lambda-java.html)
- [https://github.com/awslabs/aws-lambda-powertools-java](https://github.com/awslabs/aws-lambda-powertools-java)
