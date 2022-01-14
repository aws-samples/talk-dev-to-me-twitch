import { getProduct } from "../domain/Products";
import { v4 as uuid} from "uuid";
import { ProductStore } from "../store/product-store";

jest.mock('../store/dynamodb/dynamodb-store');

describe('product_domain', function(){
    describe('get_product', function(){
        it('should return product with same id when exists', async () => {
            // Arrange
            const id = uuid();
            const product = {
                id,
                name: `product ${id}`,
                price: 10
            };

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn().mockImplementation((productId) => {
                    if (productId === product.id) {
                        return product;
                    }

                    return {};

                }),
                getProducts: jest.fn(),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act        
            const next = getProduct(tmpStore);
            const result = await next(id);

            // Assert
            expect(tmpStore.getProduct).toHaveBeenCalled();
            expect(result.id).toBe(product.id);

        });

        it('should return empty if id does not exist', async () => {
            // Arrange
            const id = uuid();
            const otherId = uuid();
            const product = {
                id,
                name: `product ${id}`,
                price: 10
            };

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn().mockImplementation((productId) => {
                    if (productId === product.id) {
                        return product;
                    }
                    return {};
                }),
                getProducts: jest.fn(),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act        
            const next = getProduct(tmpStore);

            const result = await next(otherId);

            // Assert
            expect(tmpStore.getProduct).toHaveBeenCalled();
            expect(result).toStrictEqual({});

        });

        it('should throw if store fails to get product', async () => {
            // Arrange
            const id = uuid();

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn().mockImplementation(() => {
                    throw new Error("test error");
                }),
                getProducts: jest.fn(),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act        
            try {
                const next = getProduct(tmpStore);
                await next(id);
            }
            catch (error: any) {
                expect(error.message).toEqual("test error");
            }

            // Assert
            expect(tmpStore.getProduct).toHaveBeenCalled();
            expect(tmpStore.getProduct).toThrowError();
        });
    }); 
});