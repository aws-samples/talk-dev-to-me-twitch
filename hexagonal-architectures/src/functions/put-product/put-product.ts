import { DynamoDbStore } from "../../store/dynamodb/dynamodb-store";
import { createProduct } from "../../domain/Products";
import { CreateProductAPIGWAdapter } from "../../adapters/api-gateway";
// import { CreateProductEBAdapter } from "../../adapters/event-bridge";

const tableName = process.env.TABLE;

const store = new DynamoDbStore(tableName!);
const domain = createProduct(store);

export const handler = CreateProductAPIGWAdapter(domain);
// export const handler = CreateProductEBAdapter(domain);