import { Product } from "../../model/product";
import { ProductStore } from "../product-store";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandOutput,
    PutCommand,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";

export class DynamoDbStore implements ProductStore {
    tableName: string;

    private static ddbClient = new DynamoDBClient({});
    private static ddbDocClient : DynamoDBDocumentClient =
            DynamoDBDocumentClient.from(DynamoDbStore.ddbClient);

    constructor(tableName: string) {
        console.info(`Table Name: ${tableName}`);
        if(tableName === undefined){
            throw new Error("'TABLE' not defined.");
        }

        this.tableName = `${tableName}`;
    }

    public getProduct = async (id: string): Promise<Product> => {
        const params: GetCommand = new GetCommand({
            TableName: this.tableName,
            Key: {
                id: id
            }
        });
        const result: GetCommandOutput = await DynamoDbStore.ddbDocClient.send(params);
        return result.Item as Product;
    };

    public putProduct = async (product: Product): Promise<void> => {
        const params: PutCommand = new PutCommand({
            TableName: this.tableName,
            Item: {
                id: product.id,
                name: product.name,
                price: product.price,
            },
        });
        await DynamoDbStore.ddbDocClient.send(params);
    };

    public deleteProduct = async (id: string): Promise<void> => {
        const params: DeleteCommand = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                id: id,
            },
        });
        await DynamoDbStore.ddbDocClient.send(params);
    };

    public getProducts = async (): Promise<Product[]> => {
        const params:ScanCommand = new ScanCommand( {
            TableName: this.tableName,
            Limit: 20
        });
        const result = await DynamoDbStore.ddbDocClient.send(params);
        return result.Items as Product[];
    };



}