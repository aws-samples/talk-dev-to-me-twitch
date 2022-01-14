import { EventBridgeHandler } from "aws-lambda";
import { CreateProduct } from "../domain/Products";
import { Product } from "../model/product";

enum ProductEventTypes {
    CreationRequested = "ProductCreationRequested",
    Created = "ProductCreated",
    Deleted = "ProductDeleted"
}

export const CreateProductEBAdapter = (next: CreateProduct): EventBridgeHandler<any, any, any> => async (event) => {
    try {
        
        if (event["detail-type"] === ProductEventTypes.CreationRequested) {

            console.log(`Product Payload: ${JSON.stringify(event.detail)}`);
            const product = new Product(event.detail);

            try {
                await next(product);                
            } catch (error) {
                console.error(error);
            }
        }
        else {
            console.warn(`Product not provided`);
        }
    } catch (error) {
        console.error(error);
    }
}