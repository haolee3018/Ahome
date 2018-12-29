
from flask import Flask

from Ahome.user_views import user_blue
from Ahome.house_views import house_blue
from Ahome.order_views import order_blue
from Ahome.models import db

from utils.setting import STATIC_PATH, TEMPLATE_PATH
from utils.config import Config


def create_app():
    a_home = Flask(__name__,
                   static_folder=STATIC_PATH,
                   template_folder=TEMPLATE_PATH)

    a_home.config.from_object(Config)

    a_home.register_blueprint(blueprint=user_blue, url_prefix='/user')
    a_home.register_blueprint(blueprint=house_blue, url_prefix='/house')
    a_home.register_blueprint(blueprint=order_blue, url_prefix='/order')

    db.init_app(a_home)

    return a_home
