import { DynamoDbStore } from "../../store/dynamodb/dynamodb-store";
import { getProduct } from "../../domain/Products";
import { GetProductAPIGWAdapter } from "../../adapters/api-gateway";

const tableName = process.env.TABLE;

const store = new DynamoDbStore(tableName!);
const domain = getProduct(store);

export const handler = GetProductAPIGWAdapter(domain);

