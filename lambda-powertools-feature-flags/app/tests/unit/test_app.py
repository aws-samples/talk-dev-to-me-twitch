import app
from aws_lambda_powertools.utilities.feature_flags import RuleAction, FeatureFlags, AppConfigStore


def init_feature_flags(mocker, mock_schema, envelope="") -> FeatureFlags:
    """Mock AppConfig Store get_configuration method to use mock schema instead"""

    method_to_mock = "aws_lambda_powertools.utilities.feature_flags.AppConfigStore.get_configuration"
    mocked_get_conf = mocker.patch(method_to_mock)
    mocked_get_conf.return_value = mock_schema

    app_conf_store = AppConfigStore(
        environment="test_env",
        application="test_app",
        name="test_conf_name",
        envelope=envelope,
    )

    return FeatureFlags(store=app_conf_store)


def test_app_returns_products():
    products = app.products()

    assert len(products) == 2
    assert products[0]["price"] == 3549
    assert products[1]["price"] == 6349


def test_app_retuns_product_by_id():
    products = app.products_by_id("1")

    assert products[0]['name'] == 'Mechanical Keyboard 9000'
    assert products[0]['price'] == 3549


def test_app_adds_discount_for_premium_features():
    product = [{"productId": "1", "name": "Mechanical Keyboard 9000", "price": 3549}]
    product_with_discount = app.add_premium_info(product, True)
    assert product_with_discount[0]["discount"] == "10%"


def test_premium_feature_flag_is_true_with_ctx(mocker):
    expected_value = True
    mocked_app_config_schema = {
        "premium_features": {
            "default": False,
            "rules": {
                "customer tier equals premium": {
                    "when_match": True,
                    "conditions": [
                        {
                            "action": RuleAction.EQUALS.value,
                            "key": "tier",
                            "value": "premium"
                        }
                    ]
                }
            }
        },
        "tier_feature": {
            "default": True
        }
    }

    # WHEN
    ctx = {"tier": "premium"}
    feature_flags = init_feature_flags(mocker=mocker, mock_schema=mocked_app_config_schema)
    flag = feature_flags.evaluate(name="premium_features", context=ctx, default=False)
    assert flag == expected_value


def test_premium_feature_flag_false_rule_does_not_match(mocker):
    expected_value = False
    mocked_app_config_schema = {
        "premium_features": {
            "default": False,
            "rules": {
                "customer tier equals premium": {
                    "when_match": True,
                    "conditions": [
                        {
                            "action": RuleAction.EQUALS.value,
                            "key": "tier",
                            "value": "premium"
                        }
                    ]
                }
            }
        },
        "tier_feature": {
            "default": True
        }
    }

    # WHEN
    ctx = {"tier": "basic"}
    feature_flags = init_feature_flags(mocker=mocker, mock_schema=mocked_app_config_schema)
    flag = feature_flags.evaluate(name="premium_features", context=ctx, default=False)
    assert flag == expected_value


def test_premium_feature_flag_default_value_no_context(mocker):
    expected_value = False

    mocked_app_config_schema = {
        "premium_features": {
            "default": False,
            "rules": {
                "customer tier equals premium": {
                    "when_match": True,
                    "conditions": [
                        {
                            "action": RuleAction.EQUALS.value,
                            "key": "tier",
                            "value": "premium"
                        }
                    ]
                }
            }
        },
        "tier_feature": {
            "default": True
        }
    }

    # WHEN
    feature_flags = init_feature_flags(mocker=mocker, mock_schema=mocked_app_config_schema)
    flag = feature_flags.evaluate(name="premium_features", default=False)
    assert flag == expected_value
