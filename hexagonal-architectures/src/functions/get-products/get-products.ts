import { DynamoDbStore } from "../../store/dynamodb/dynamodb-store";
import { getProducts } from "../../domain/Products";
import { GetProductsAPIGWAdapter } from "../../adapters/api-gateway";

const tableName = process.env.TABLE;

const store = new DynamoDbStore(tableName!);
const domain = getProducts(store);

export const handler = GetProductsAPIGWAdapter(domain);