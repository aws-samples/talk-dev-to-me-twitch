from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.event_handler.api_gateway import ApiGatewayResolver
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.feature_flags import AppConfigStore, FeatureFlags
from aws_lambda_powertools.utilities.typing import LambdaContext
from typing import List, Dict

tracer = Tracer()
logger = Logger()
metrics = Metrics()
app = ApiGatewayResolver()

app_config = AppConfigStore(
    environment="dev-env",
    application="productapp",
    name="configProfile"
)

feature_flags = FeatureFlags(store=app_config)
tier = feature_flags.evaluate(name="tier_feature",
                              default=False)

ctx = {"username": "alex", "tier": "premium", "location": "DE"}

all_products = [
    {"productId": "1", "name": "Mechanical Keyboard 9000", "price": 3549},
    {"productId": "2", "name": "Super Printer X3", "price": 6349},
]


@app.get("/products")
def products():
    return get_products()


@app.get("/products/<id>")
def products_by_id(id: str):
    return get_products(id)


def get_products(id=None) -> List[Dict]:
    if id:
        resp_products = list(filter(lambda x: x["productId"] == id, all_products))
    else:
        resp_products = all_products

    resp_products = add_discount(resp_products)
    return resp_products


def add_discount(input_products: List[Dict]) -> List[Dict]:
    discount_flag: bool = feature_flags.evaluate(name="discount", default=False)

    has_premium_features: bool = feature_flags.evaluate(name="premium_features",
                                                        context=ctx,
                                                        default=False)
    discount = {}
    if discount_flag:
        discount = {"discount": "10%"}
    if has_premium_features:
        discount = {"discount": "20%"}

    return [{**x, **discount} for x in input_products]


@metrics.log_metrics(capture_cold_start_metric=True)
@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@tracer.capture_lambda_handler
def lambda_handler(event, context: LambdaContext):
    try:
        return app.resolve(event, context)
    except Exception as e:
        logger.exception(e)
        raise
