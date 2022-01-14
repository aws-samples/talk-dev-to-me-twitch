import { CreateProduct, DeleteProduct, GetProduct, GetProducts } from "../domain/Products";
import { Product } from "../model/product";
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

const response = (body: string, statusCode = 200) : APIGatewayProxyResult => ({
    body,
    statusCode,
    headers: {"Content-Type": "text/plain"},
});

export const GetProductAPIGWAdapter = (next: GetProduct) : APIGatewayProxyHandler => async event => {
    const id = event.pathParameters!.id;

    if(!id){
        return response("Product Id not defined", 500);
    }

    try{
        const result = await next(id);
        if(!result){
            return response(`Product with Id ${id} does not exist`, 404);
        }

        return response(JSON.stringify(result), 200);
    } catch (err) {
        console.error(err);
        return response("Unknown error", 500);
    }
}

export const GetProductsAPIGWAdapter = (next: GetProducts) : APIGatewayProxyHandler => async () => {
    try{
        const result = await next();
        if(!result){
            return response(`Products not available.`, 404);
        }

        return response(JSON.stringify(result), 200);
    } catch (err) {
        console.error(err);
        return response("Unknown error", 500);
    }
}

export const DeleteProductAPIGWAdapter = (next: DeleteProduct) : APIGatewayProxyHandler => async event => {
    const id = event.pathParameters!.id;

    if(!id){
        return response("Product Id not defined", 500);
    }

    try{
        await next(id);
        return response(JSON.stringify({ message: "Product deleted" }), 200);
    } catch (err) {
        console.error(err);
        return response("Unknown error", 500);
    }
}

export const CreateProductAPIGWAdapter = (next: CreateProduct) : APIGatewayProxyHandler => async event => {
    try {
        console.log(event.body);

        if(event.body != null){
            const payload = JSON.parse(event.body);
            const product = new Product(payload);

            try {
                await next(product);
                return response(JSON.stringify({ message: "Product created"}), 201)
            } catch (error) {
                console.error(error);
                return response(JSON.stringify({message: "Failed to create product"}), 500);
            }
        }
        else {
            return response(JSON.stringify({message: "Product not provided"}), 400);
        }
    } catch (error) {
        console.error(error);
        return response(JSON.stringify({message: "Failed to parse product from request body"}), 400);
    }
}
