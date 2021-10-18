const AWSXRay = require('aws-xray-sdk')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

const DBclient = new AWS.DynamoDB.DocumentClient()

const EVBclient = new AWS.EventBridge()

var table = process.env.TABLE_NAME
var eventBusName = process.env.EVENT_BUS_NAME

const resolvers = {
    Mutation: {
        submitVacationRequest: async (ctx) => {

            // PERSIST DATA
            var params = {
                TableName: table,
                Item: ctx.arguments.input
            }

            const data = await DBclient.put(params).promise()

            if (data.$response.error) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(data.$response.error, null, 2));
            }
            else {

                console.log("Successfully added item to database. " + JSON.stringify(ctx.arguments.input))

                // SEND EVENT AFTER SUCCESSFULLY PERSISTING DATA
                params = {
                    "Entries": [
                        {
                            "Detail": JSON.stringify(ctx.arguments.input),
                            "DetailType": "VacationRequestSubmited",
                            "EventBusName": eventBusName,
                            "Source": "VacationTrackerApp",
                            "Time": new Date()
                        }
                    ]
                }

                var result = await EVBclient.putEvents(params).promise()

                if (result.$response.error) {
                    console.error("Unable to send event. Error JSON:", JSON.stringify(result.$response.error, null, 2));
                }
                else {
                    console.log("Successfully sent event. " + JSON.stringify(result.$response.data))
                    return ctx.arguments.input;
                }
            }
        }
    }
}

exports.handler = async function (event) {
    const typeHandler = resolvers[event.typeName];
    if (typeHandler) {
        const resolver = typeHandler[event.fieldName];
        if (resolver) {
            const result = await resolver(event);

            return result;
        }
    }
};