
import os

from datetime import datetime

from flask import Blueprint, request, render_template, session, \
    jsonify
from sqlalchemy import or_, and_

from utils.functions import is_login
from utils.setting import UPLOAD_PATH

from Ahome.models import User, House, Facility, Area, HouseImage, Order

house_blue = Blueprint('house', __name__)


# 首页
@house_blue.route('/index/', methods=['GET'])
@is_login
def index_get():
    if request.method == 'GET':
        return render_template('index.html')


# 获取区域和设施信息
@house_blue.route('/area_facility_info/', methods=['GET'])
def get_area_facility_info():
    if request.method == 'GET':
        areas = Area.query.all()
        facilities = Facility.query.all()
        areas_list = [area.to_dict() for area in areas]
        facilities_list = [fac.to_dict() for fac in facilities]
        return jsonify({'code': 200, 'msg': '请求成功', 'data': areas_list, 'data_1': facilities_list})


# 获取房源信息
@house_blue.route('/get_house_info/', methods=['GET'])
@is_login
def get_house_info():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        # 实名后才会返回信息
        if user.id_card:
            houses = House.query.filter(House.user_id == session['user_id'])
            house_info = [house.to_dict() for house in houses]
            return jsonify({'code': 200, 'msg': '请求成功', 'data': house_info})
        else:
            return jsonify({'code': 10008, 'msg': '还没有实名认证'})


# 我的房源
@house_blue.route('/myhouse/', methods=['GET'])
@is_login
def myhouse_get():
    if request.method == 'GET':
        return render_template('myhouse.html')


# 发布房源
@house_blue.route('/newhouse/', methods=['GET'])
@is_login
def newhouse_get():
    if request.method == 'GET':
        return render_template('newhouse.html')


@house_blue.route('/newhouse/', methods=['POST'])
@is_login
def newhouse_post():
    if request.method == 'POST':
        my_house = House()
        # 获取信息
        my_house.user_id = session['user_id']
        my_house.title = request.form.get('title')
        my_house.price = request.form.get('price')
        my_house.area_id = request.form.get('area_id')
        my_house.address = request.form.get('address')
        my_house.room_count = request.form.get('room_count')
        my_house.acreage = request.form.get('acreage')
        my_house.unit = request.form.get('unit')
        my_house.capacity = request.form.get('capacity')
        my_house.beds = request.form.get('beds')
        my_house.deposit = request.form.get('deposit')
        my_house.min_days = request.form.get('min_days')
        my_house.max_days = request.form.get('max_days')
        # 获取所有勾选的设施
        facilities = request.form.getlist('facility')
        for f_id in facilities:
            f_id = int(f_id)
            facility = Facility.query.get(f_id)
            my_house.facilities.append(facility)
        my_house.add_update()

        return jsonify({'code': 200, 'data':my_house.id})


# 上传房屋图片
@house_blue.route('/newhouse_image/', methods=['POST'])
@is_login
def newhouse_image():
    if request.method == 'POST':
        my_house_id = request.form.get('house_id')
        house_img = request.files.get('house_image')
        # 图片路径 static/media/upload/xxxx.jpg
        house_img_path = os.path.join(UPLOAD_PATH, house_img.filename)
        house_img.save(house_img_path)
        # 保存图片信息
        h_img = HouseImage()
        h_img.url = os.path.join('upload', house_img.filename)
        h_img.house_id = my_house_id
        h_img.add_update()
        # 创建首图信息
        house = House.query.get(my_house_id)
        if not house.index_image_url:
            house.index_image_url = os.path.join('upload', house_img.filename)
            house.add_update()
        return jsonify({'code': 200, 'data': h_img.url})


# 房源详情信息
@house_blue.route('/detail/', methods=['GET'])
@is_login
def detail_get():
    if request.method == 'GET':
        return render_template('detail.html')


@house_blue.route('/get_house_detail/<int:id>/', methods=['GET'])
@is_login
def get_house_detail(id):
    if request.method == 'GET':
        house = House.query.get(id)
        house_info = house.to_full_dict()

        if house.user_id == session['user_id']:
            booking_button = 0
            return jsonify({'code': 200, 'msg': '获取房屋详情信息成功', 'data': house_info, 'booking': booking_button})
        else:
            booking_button = 1
            return jsonify({'code': 200, 'msg': '获取房屋详情信息成功', 'data': house_info, 'booking': booking_button})


# 搜索
@house_blue.route('/search/', methods=['GET'])
@is_login
def search_get():
    if request.method == 'GET':
        return render_template('search.html')


@house_blue.route('/search/', methods=['POST'])
def search_post():
    form = request.form
    aid = form.get('aid')
    sd = form.get('sd')
    ed = form.get('ed')
    # 根据地区筛选出house
    if aid:
        houses = House.query.filter(House.area_id == aid)
    else:
        houses = House.query.all()
    area_house_id = {house.id for house in houses}
    # 得到正在使用的house
    orders = Order.query.filter(Order.status.in_(["WAIT_ACCEPT", "WAIT_PAYMENT", "PAID"]))
    # 根据时间来筛选house
    if (sd and ed):
        sd = datetime.strptime(sd, "%Y-%m-%d")
        ed = datetime.strptime(ed, "%Y-%m-%d")
        house_inuse = orders.filter(or_(and_(Order.end_date <= ed, Order.end_date >= sd),and_(Order.begin_date <= ed, Order.begin_date >= sd)))
        house_inuse_id = set([house.house_id for house in house_inuse])
    else:
        # 如果开始时间，结束时间没填全，就不做筛选
        house_inuse_id = set()

    house_can_order_id = list(area_house_id-house_inuse_id)
    if not house_can_order_id:
        return jsonify({'code':1001,'msg':'没有房子'})

    # 封装数据
    data = []
    for id in house_can_order_id:
        house = houses.filter(House.id == id).first()
        msg = house.to_full_dict()
        # 入住人数
        num = len(house.orders)
        msg['num']=num
        # 创建时间
        create_time = house.create_time
        msg['create_time']=create_time
        data.append(msg)
    # 排序
    sort_key = form.get('sort_key')
    if sort_key == 'num':
        # 根据入住人数
        data = sorted(data, key=lambda msg:msg['num'], reverse=True)
    elif sort_key == 'price_asc':
        # 根据价格升序
        data = sorted(data, key=lambda msg:msg['price'])
    elif sort_key == 'price_desc':
        # 根据价格降序
        data = sorted(data, key=lambda msg:msg['price'], reverse=True)
    else:
        # 根据上线时间(默认)
        data = sorted(data, key=lambda msg:msg['create_time'], reverse=True)
    return jsonify({'code': 200, 'houses': data})


@house_blue.route('/get_area/', methods = ['GET'])
def get_area():
    areas = Area.query.all()
    area_name = [area.name for area in areas]
    return jsonify({'area': area_name})


@house_blue.route('/get_all_houses/', methods=['GET'])
def get_all_houses():
    houses = House.query.all()
    data = []
    for house in houses:
        house = house.to_dict()
        data.append(house)
    return jsonify({'code': 200, 'houses': data})
