from functools import wraps

from flask import session, redirect, url_for

def get_sqlalchemy_uri(DATABASE):
    # mysql+pymysql://root:123456@127.0.0.1:3306/A_home
    user = DATABASE['USER']
    password = DATABASE['PASSWORD']
    host = DATABASE['HOST']
    port = DATABASE['PORT']
    name = DATABASE['NAME']
    engine = DATABASE['ENGINE']
    driver = DATABASE['DRIVER']
    return '%s+%s://%s:%s@%s:%s/%s' % (engine, driver,
                                       user, password,
                                       host, port, name)


def is_login(func):
    @wraps(func)
    def check_login_status(*args, **kwargs):
        try:
            session['user_id']
        except:
            return redirect(url_for('user.login_get'))
        return func(*args, **kwargs)
    return check_login_status