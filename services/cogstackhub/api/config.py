import os

# Path to the folder containing Cogstack models
models = dict(
    path = os.path.abspath(os.path.join(os.getcwd(), 'api/models')),
)
# Path to folder containing text2sql model
text2sql = dict(
    path = '',
)