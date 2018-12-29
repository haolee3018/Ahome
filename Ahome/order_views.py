
from time import strftime, strptime
from datetime import datetime

from flask import Blueprint, request, render_template, session, jsonify
from sqlalchemy import or_, and_

from utils.functions import is_login
from Ahome.models import House, Order, User

order_blue = Blueprint('order', __name__)


@order_blue.route('/booking/', methods=['GET'])
@is_login
def booking_get():
    if request.method == 'GET':
        return render_template('booking.html')


@order_blue.route('/orders/', methods=['GET'])
@is_login
def orders_get():
    if request.method == 'GET':
        return render_template('orders.html')


@order_blue.route('/lorders/', methods=['GET'])
@is_login
def lorders_get():
    if request.method == 'GET':
        return render_template('lorders.html')


@order_blue.route('/get_booking_house/',methods=['POST'])
def get_booking_house():
    if request.method == 'POST':
        id = request.form.get('id')
        house = House.query.get(id)
        # 判断是否是本人发布的房源
        user_id = session.get('user_id')
        house_user_id = house.user_id
        is_mine = False
        if user_id == house_user_id:
            is_mine = True
        info = [house.to_dict()]
        return jsonify({'code':200,'houses':info,'is_mine':is_mine})


@order_blue.route('/make_order/',methods = ['POST'])
def make_order():
    if request.method == 'POST':
        user = User.query.get(session['user_id'])
        if user.id_card:
            data = request.form
            id = data.get('id')
            sd = data.get('start_date')
            ed = data.get('end_date')
            # 对订单时间进行验证
            # 得到正在使用的house
            orders = Order.query.filter(Order.status.in_(["WAIT_ACCEPT", "WAIT_PAYMENT", "PAID"]))
            # 根据时间来筛选house
            if (sd and ed):
                start_date = datetime.strptime(sd, "%Y-%m-%d")
                end_date = datetime.strptime(ed, "%Y-%m-%d")
                house_inuse = orders.filter(
                    or_(and_(Order.end_date <= end_date, Order.end_date >= start_date), and_(Order.begin_date <= end_date, Order.begin_date >= start_date)))
                house_inuse_id = [house.house_id for house in house_inuse]
            else:
                # 如果开始时间，结束时间没填全，返回错误
                return jsonify({'code':1001,'msg':'参数不全'})
            if id in house_inuse_id:
                return jsonify({'code': 1001, 'msg': '房子在使用'})

            # 创建订单
            order = Order()
            order.user_id = session.get('user_id')
            order.house_id = id
            order.begin_date = start_date
            order.end_date = end_date
            start_date = strptime(sd, '%Y-%m-%d')
            end_date = strptime(ed, '%Y-%m-%d')
            start_date = datetime(start_date[0], start_date[1], start_date[2])
            end_date = datetime(end_date[0], end_date[1], end_date[2])
            order.days = (end_date-start_date).days+1
            order.house_price = House.query.get(id).price
            order.amount = order.days * order.house_price
            order.add_update()
            return jsonify({'code': 200,'amount': order.amount})


@order_blue.route('/get_myorders/', methods=['GET'])
def get_myorders():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        if user.id_card:
            user_id = session.get('user_id')
            orders = Order.query.filter(Order.user_id == user_id).order_by('-create_time').all()
            data = []
            for order in orders:
                order = order.to_dict()
                comment = order['comment']
                if str(comment).startswith('REJECTED'):
                    order['comment'] = ''
                    order['rejected'] = comment[8:]
                data.append(order)

            return jsonify({'code': 200, 'orders': data})


@order_blue.route('/get_lorders/', methods=['GET'])
def get_lorders():
    if request.method == 'GET':
        user = User.query(session['user_id'])
        if user.id_card:
            user_id = session.get('user_id')
            houses = House.query.filter(House.user_id == user_id).all()
            orders = [house.orders for house in houses]
            my_lorders = []
            for order in orders:
                my_lorders += order
            # 列表中封装的对象，需要进一步处理
            if my_lorders:
                my_lorders = [order.to_dict() for order in my_lorders]
                my_lorders = sorted(my_lorders,key=lambda my_order:my_order['order_id'],reverse=True)

            return jsonify({'code': 200, 'orders': my_lorders})
