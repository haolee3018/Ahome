
import random, os, re

from flask import Blueprint, request, render_template, redirect, \
    jsonify, session, url_for

from Ahome.models import User
from utils.functions import is_login
from utils.setting import UPLOAD_PATH


user_blue = Blueprint('user', __name__)


# 图片验证码
@user_blue.route('/get_img_code/', methods=['GET'])
def get_img_code():
    if request.method == 'GET':
        r = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM'
        img_code = ''
        for _ in range(4):
            img_code += random.choice(r)
        session['img_code'] = img_code
    return jsonify({'code': 200, 'msg': '请求成功', 'data': img_code})


# 退出登录
@user_blue.route('/logout/', methods=['GET'])
@is_login
def logout():
    if request.method == 'GET':
        session.__delitem__('user_id')
        return jsonify({'code': 200, 'msg': '请求成功，已退出'})


# 获取用户信息
@user_blue.route('/get_user/', methods=['GET'])
@is_login
def get_user():
    user_id = int(session['user_id'])
    user_data = User.query.get(user_id).to_basic_dict()
    return jsonify({'code': 200, 'data': user_data})


# 获取用户实名信息
@user_blue.route('/get_user_auth/', methods=['GET'])
@is_login
def get_user_auth():
    if request.method == 'GET':
        user_id = session['user_id']
        user_auth_data = User.query.get(user_id).to_auth_dict()
        if user_auth_data['id_name'] and user_auth_data['id_card']:
            return jsonify({'code': 200, 'data': user_auth_data})
        else:
            return jsonify({'code': 1111})


# 注册
@user_blue.route('/register/', methods=['GET'])
def register_get():
    if request.method == 'GET':
        return render_template('register.html')


@user_blue.route('/register/', methods=['POST'])
def register_post():
    if request.method == 'POST':
        mobile = request.form.get('mobile')
        password = request.form.get('password')
        password2 = request.form.get('password2')
        img_code = request.form.get('img_code')

        if not all([mobile, password, password2, img_code]):
            return jsonify({'code': 10001, 'msg': '请填写完整'})

        img_co = session['img_code']
        if img_co != img_code:
            return jsonify({'code': 10002, 'msg': '图片验证码有误'})

        if password != password2:
            return jsonify({'code': 10003, 'msg': '两次输入密码不一致'})

        user = User.query.filter(User.phone == mobile).first()
        if user:
            return jsonify({'code': 10004, 'msg': '该手机号已注册过，请直接登录'})
        else:
            user = User()
            user.phone = mobile
            user.password = password
            # user.pwd_hash = User.password(password, password)
            user.add_update()
            return jsonify({'code': 200, 'msg': '注册成功'})


# 登录
@user_blue.route('/login/', methods=['GET'])
def login_get():
    if request.method == 'GET':
        return render_template('login.html')


@user_blue.route('/login/', methods=['POST'])
def login_post():
    if request.method == 'POST':
        phone = request.form.get('mobile')
        password = request.form.get('passwd')
    if not all([phone, password]):
        return jsonify({'code': 10001, 'msg': '请填写完整'})
    user = User.query.filter(User.phone == phone).first()
    if not user:
        return jsonify({'code': 10005, 'msg': '不存在该用户，请注册'})
    res = user.check_pwd(password)
    if res:
        session['user_id'] = user.id
        return jsonify({'code': 200, 'msg': '登录成功'})
    else:
        return jsonify({'code': 10006, 'msg': '密码错误，请重新输入'})


# 个人信息主页
@user_blue.route('/my_info/', methods=['GET'])
@is_login
def my_info_get():
    if request.method == 'GET':
        return render_template('my.html')


@user_blue.route('/my_info/', methods=['POST'])
@is_login
def my_info_post():
    pass


# 修改个人信息
@user_blue.route('/profile/', methods=['GET'])
@is_login
def profile_get():
    if request.method == 'GET':
        return render_template('profile.html')


@user_blue.route('/profile/', methods=['POST', 'PATCH'])
@is_login
def profile_patch():
    user = User.query.get(session['user_id'])
    if request.method == 'PATCH':
        avatar = request.files.get('avatar')
        if avatar:
            # 保存头像图片的路径
            avatar.save(os.path.join(UPLOAD_PATH, avatar.filename))
            upload_avatar_path = os.path.join('upload', avatar.filename)
            user.avatar = upload_avatar_path
            user.add_update()
            return jsonify({'code': 200, 'msg': '上传成功', 'data': upload_avatar_path})

    if request.method == 'POST':
        user_name = request.form.get('user_name')
        user.name = user_name
        user.add_update()
        return jsonify({'code': 200, 'msg': '上传成功', 'data': user_name})


# 实名认证
@user_blue.route('/auth/', methods=['GET'])
@is_login
def auth_get():
    if request.method == 'GET':
        return render_template('auth.html')


@user_blue.route('/auth/', methods=['POST'])
@is_login
def auth_post():
    if request.method == 'POST':
        # 获取数据
        real_name = request.form.get('real_name')
        id_card = request.form.get('id_card')
        data = {'real_name': real_name, 'id_card': id_card}
        # 是否填写完整
        if not all([real_name, id_card]):
            return jsonify({'code': 10001, 'msg': '请填写完整', 'data': data})
        # 匹配身份证正则
        pattern = re.compile(r'^([1-9]\d{5}[12]\d{3}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d{3}[0-9xX])$')
        result = pattern.match(id_card)
        if not result:
            return jsonify({'code': 10007, 'msg': '身份证号不正确', 'data': data})
        else:
            # 存入数据库
            user = User.query.get(session['user_id'])
            user.id_name = real_name
            user.id_card = id_card
            user.add_update()
            return jsonify({'code': 200, 'msg': '实名认证成功'})

