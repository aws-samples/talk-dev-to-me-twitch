import { getProduct, getProducts, createProduct, deleteProduct } from "../domain/Products";
import { v4 as uuid } from "uuid";
import { ProductStore } from "../store/product-store";
import { Product } from "../model/product";

jest.mock('../store/dynamodb/dynamodb-store');

describe('product_domain', function () {
    describe('get_product', function () {
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

    describe('get_products', function () {
        it('should return all products available', async () => {
            // Arrange
            const productList = [
                new Product({
                    "id": "1",
                    "name": "product 1",
                    "price": 100
                }),
                new Product({
                    "id": "2",
                    "name": "product 2",
                    "price": 200
                })
            ];

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn(),
                getProducts: jest.fn().mockReturnValue(productList),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act        
            const next = getProducts(tmpStore);
            const result = await next();

            // Assert
            expect(tmpStore.getProducts).toHaveBeenCalled();
            expect(result.length).toBe(productList.length);

        });

        it('should return empty array when no products are available', async () => {
            // Arrange
            const emptyProductList: Product[] = [];

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn(),
                getProducts: jest.fn().mockReturnValue(emptyProductList),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act        
            const next = getProducts(tmpStore);
            const result = await next();

            // Assert
            expect(tmpStore.getProducts).toHaveBeenCalled();
            expect(result).toMatchObject([]);
        });

        it('should throw on store error', async () => {
            // Arrange
            const emptyProductList: Product[] = [];

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn(),
                getProducts: jest.fn().mockImplementation(() => {
                    throw new Error("test error");
                }),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act   
            try {
                const next = getProducts(tmpStore);
                await next();
            }
            catch (error: any) {
                expect(error.message).toEqual("test error");
            }

            // Assert
            expect(tmpStore.getProducts).toHaveBeenCalled();
            expect(tmpStore.getProducts).toThrowError();
        });
    });

    describe('create_product', function () {
        it('should create product when valid', async () => {
            // Arrange
            const product =
                new Product({
                    "id": "1",
                    "name": "product 1",
                    "price": 100
                });

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn(),
                getProducts: jest.fn(),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act        
            const next = createProduct(tmpStore);
            await next(product);

            // Assert
            expect(tmpStore.putProduct).toHaveBeenCalled();
        });

        it('should throw on store error', async () => {
            // Arrange
            const product =
                new Product({
                    "id": "1",
                    "name": "product 1",
                    "price": 100
                });

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn(),
                getProducts: jest.fn(),
                putProduct: jest.fn().mockImplementation(() => {
                    throw new Error("test error");
                }),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act
            try {
                const next = createProduct(tmpStore);
                await next(product);
            }
            catch (error: any) {
                expect(error.message).toEqual("test error");
            }

            // Assert
            expect(tmpStore.putProduct).toHaveBeenCalled();
            expect(tmpStore.putProduct).toThrowError();
        });
    });

    describe('delete_product', function () {
        it('should delete product when id exists', async () => {
            // Arrange
            const productId = "1";

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn(),
                getProducts: jest.fn(),
                putProduct: jest.fn(),
                deleteProduct: jest.fn()
            }));

            const tmpStore = new storeMock();

            // Act        
            const next = deleteProduct(tmpStore);
            await next(productId);

            // Assert
            expect(tmpStore.deleteProduct).toHaveBeenCalled();
        });

        it('should throw on store error', async () => {
            // Arrange
            const productId = "1";

            const storeMock = jest.fn<ProductStore, any[]>(() => ({
                getProduct: jest.fn(),
                getProducts: jest.fn(),
                putProduct: jest.fn(),
                deleteProduct: jest.fn().mockImplementation(() => {
                    throw new Error("test error");
                })
            }));

            const tmpStore = new storeMock();

            // Act
            try {
                const next = deleteProduct(tmpStore);
                await next(productId);
            }
            catch (error: any) {
                expect(error.message).toEqual("test error");
            }

            // Assert
            expect(tmpStore.deleteProduct).toHaveBeenCalled();
            expect(tmpStore.deleteProduct).toThrowError();
        });
    });
});