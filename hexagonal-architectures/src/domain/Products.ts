import { ProductStore } from "../store/product-store";
import { Product } from "../model/product";

export type GetProduct = (id: string) => Promise<Product>;
export type GetProducts = () => Promise<Product[]>;
export type DeleteProduct = (id: string) => Promise<void>;
export type CreateProduct = (product: Product) => Promise<void>;

export const getProduct = (store: ProductStore): GetProduct => async (id: string): Promise<Product> => {
    try {
        console.info(`Fetching product ${id}`)
        const result = await store.getProduct(id);
        if (!result) {
            console.warn(`No product with id: ${id}`);
            return {} as Product;
        }

        return result;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getProducts = (store: ProductStore): GetProducts => async (): Promise<Product[]> => {
    try {
        const result = await store.getProducts();
        if (!result) {
            console.warn(`No products available.`);
            return [];
        }

        return result;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteProduct = (store: ProductStore): DeleteProduct => async (id: string): Promise<void> => {
    try {
        console.info(`Deleting product ${id}`)
        await store.deleteProduct(id);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createProduct = (store: ProductStore): CreateProduct => async (product: Product): Promise<void> => {
    try {
        console.info(`Adding product with Id: ${product.id}`)
        await store.putProduct(product);
        console.info(`Product '${product.id}' successfully added`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}
