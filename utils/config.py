
from utils.functions import get_sqlalchemy_uri
from utils.setting import DATABASE

class Config():
    SQLALCHEMY_DATABASE_URI = get_sqlalchemy_uri(DATABASE)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    SECRET_KEY = '1j1-39581@15$$13&44*7(7!&@$(15&!13@#'