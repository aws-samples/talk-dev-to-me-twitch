import { DynamoDbStore } from "../../store/dynamodb/dynamodb-store";
import { deleteProduct } from "../../domain/Products";
import { DeleteProductAPIGWAdapter } from "../../adapters/api-gateway";

const tableName = process.env.TABLE;

const store = new DynamoDbStore(tableName!);
const domain = deleteProduct(store);

export const handler = DeleteProductAPIGWAdapter(domain);