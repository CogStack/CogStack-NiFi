from enum import Enum
from typing import Any, Protocol

class ExpressionLanguageScope(Enum):
    NONE = 1
    ENVIRONMENT = 2
    FLOWFILE_ATTRIBUTES = 3


class ProcessContext(Protocol):
    def getProperties(self) -> dict[str, Any]: ...


class PropertyDescriptor:
    def __init__(self, name, description, required=False, sensitive=False,
                 display_name=None, default_value=None, allowable_values=None,
                 dependencies=None, expression_language_scope=ExpressionLanguageScope.NONE,
                 dynamic=False, validators=None,
                 resource_definition=None, controller_service_definition=None):
        if validators is None:
            validators = [StandardValidators.ALWAYS_VALID]

        self.name = name
        self.description = description
        self.required = required
        self.sensitive = sensitive
        self.displayName = display_name
        self.defaultValue = None if default_value is None else str(default_value)
        self.allowableValues = allowable_values
        self.dependencies = dependencies
        self.expressionLanguageScope = expression_language_scope
        self.dynamic = dynamic
        self.validators = validators
        self.resourceDefinition = resource_definition
        self.controllerServiceDefinition = controller_service_definition


class StandardValidators:
    ALWAYS_VALID: object
    NON_EMPTY_VALIDATOR: object
    INTEGER_VALIDATOR: object
    POSITIVE_INTEGER_VALIDATOR: object
    POSITIVE_LONG_VALIDATOR: object
    NON_NEGATIVE_INTEGER_VALIDATOR: object
    NUMBER_VALIDATOR: object
    LONG_VALIDATOR: object
    PORT_VALIDATOR: object
    NON_EMPTY_EL_VALIDATOR: object
    HOSTNAME_PORT_LIST_VALIDATOR: object
    BOOLEAN_VALIDATOR: object
    URL_VALIDATOR: object
    URI_VALIDATOR: object
    REGULAR_EXPRESSION_VALIDATOR: object
    REGULAR_EXPRESSION_WITH_EL_VALIDATOR: object
    TIME_PERIOD_VALIDATOR: object
    DATA_SIZE_VALIDATOR: object
    FILE_EXISTS_VALIDATOR: object
