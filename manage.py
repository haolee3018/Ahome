
from flask_script import Manager
from utils.app import create_app


a_home = create_app()

manage = Manager(a_home)


if __name__ == '__main__':
    manage.run()