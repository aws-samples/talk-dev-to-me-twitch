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
            "default": False
        }
    }

    # WHEN
    feature_flags = init_feature_flags(mocker=mocker, mock_schema=mocked_app_config_schema)
    flag = feature_flags.evaluate(name="premium_features", default=False)
    assert flag == expected_value
