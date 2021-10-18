/* eslint-disable no-console */
require("es6-promise").polyfill();
require("isomorphic-fetch");
// eslint-disable-next-line import/no-extraneous-dependencies
const Xray = require('aws-xray-sdk')
const AWS = Xray.captureAWS(require('aws-sdk'))
const AWSAppSyncClient = require("aws-appsync").default;
const gql = require('graphql-tag')


// graphql client.  We define it outside of the lambda function in order for it to be reused during subsequent calls
let client

function initializeClient() {
    client = new AWSAppSyncClient({
        url: process.env.APP_SYNC_API_URL,
        region: process.env.AWS_REGION,
        auth: {
            type: 'AWS_IAM',
            credentials:
            {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                sessionToken: process.env.AWS_SESSION_TOKEN
            }
        },
        disableOffline: true
    });
}

// generic mutation function.  A way to quickly reuse mutation statements
async function executeMutation(mutation, variables) {
    if (!client) {
        initializeClient();
    }


    try {
        const response = await client.mutate({
            mutation,
            variables
        })

        console.log(response.data.updateVacationRequest)

        return response.data;
    } catch (err) {
        console.log("Error while trying to mutate data: " + err.errorMessage);
        throw JSON.stringify(err);
    }
}

exports.handler = async (event) => {

    console.log(event)

    // FAKE VALIDATION LOGIC
    await executeMutation(
        gql`mutation updateVacationMutation($id:ID!) {
            updateVacationRequest(input:{
                id:$id,
                approvalStatus: PENDING_APPROVAL
            }) {
                id
                category
                startDate
                endDate
                createdAt
                }
            }`,
        {
            "id": event.detail.id
        }
    )
}
