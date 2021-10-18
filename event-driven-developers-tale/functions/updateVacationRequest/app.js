const AWSXRay = require('aws-xray-sdk')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

const DBclient = new AWS.DynamoDB.DocumentClient()

const EVBclient = new AWS.EventBridge()

var table = process.env.TABLE_NAME
var eventBusName = process.env.EVENT_BUS_NAME

const resolvers = {
    Mutation: {
        updateVacationRequest: async (ctx) => {
            let params;

            console.log(ctx.arguments.input)

            if (`${ctx.arguments.input.approvalStatus}` === "PENDING_APPROVAL") {
                // PERSIST DATA
                params = {
                    TableName: table,
                    Key: {
                        "id": ctx.arguments.input.id
                    },
                    UpdateExpression: "set approvalStatus = :new",
                    ExpressionAttributeValues: {
                        ":new": "PENDING_APPROVAL"
                    },
                    ReturnValues: "ALL_NEW"
                }
            }
            else if (`${ctx.arguments.input.approvalStatus}` === "APPROVED") {
                params = {
                    TableName: table,
                    Key: {
                        "id": ctx.arguments.input.id
                    },
                    UpdateExpression: "set approvalStatus = :new",
                    ExpressionAttributeValues: {
                        ":new": "APPROVED"
                    },
                    ReturnValues: "ALL_NEW"
                }
            }

            const data = await DBclient.update(params).promise()

            if (data.$response.error) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(data.$response.error, null, 2));
            }
            else {

                console.log("Successfully added item to database. " + JSON.stringify(ctx.arguments.input))


                // SEND EVENT AFTER SUCCESSFULLY PERSISTING DATA
                if (`${ctx.arguments.input.approvalStatus}` === "PENDING_APPROVAL") {
                    params = {
                        "Entries": [
                            {
                                "Detail": JSON.stringify(ctx.arguments.input),
                                "DetailType": "VacationRequestValidated",
                                "EventBusName": eventBusName,
                                "Source": "VacationTrackerApp",
                                "Time": new Date()
                            }
                        ]
                    }

                    const result = await EVBclient.putEvents(params).promise()

                    if (result.$response.error) {
                        console.error("Unable to send event. Error JSON:", JSON.stringify(result.$response.error, null, 2));
                    }
                    else {
                        console.log("Successfully sent event. " + JSON.stringify(result.$response.data))
                    }
                }
            }


            console.log("returning: " + JSON.stringify(data.$response.data.Attributes))
            return data.$response.data.Attributes;

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