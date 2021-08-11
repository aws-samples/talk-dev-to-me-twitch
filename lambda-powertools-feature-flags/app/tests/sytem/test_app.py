import boto3
import requests

boto3.setup_default_session(profile_name='amelnyk-Admin')

REGION = 'eu-central-1'
STACK_NAME = 'sam-product-app'


def get_api_gw_url():
    cfn = boto3.resource('cloudformation')
    stack = cfn.Stack(STACK_NAME)
    return next(x["OutputValue"] for x in stack.outputs if x["OutputKey"] == "ProductsApigwURL")


def test_call_api_returns_products():
    api_url = get_api_gw_url()
    products = requests.get(f"{api_url}/products").json()
    assert len(products) == 2


def test_call_api_return_product_when_given_id():
    api_url = get_api_gw_url()
    product = requests.get(f"{api_url}/products/1").json()
    assert product == [{"productId": "1", "name": "Mechanical Keyboard 9000", "price": 3549, "discount": "10%"}]


def test_call_api_return_empty_when_no_id_given():
    api_url = get_api_gw_url()
    resp = requests.get(f"{api_url}/products/3").json()
    assert resp == []

