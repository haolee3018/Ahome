//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框
        var $clone = $(this).clone().css('display', 'block').appendTo('body');    
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);
    $(".order-accept").on("click", function(){
        var orderId = $(this).parents("li").attr("order-id");
        $(".modal-accept").attr("order-id", orderId);
    });
    $(".order-reject").on("click", function(){
        var orderId = $(this).parents("li").attr("order-id");
        $(".modal-reject").attr("order-id", orderId);
    });

    $.get('/order/get_lorders/',function(data){
        for(i=0;i<data.orders.length;i++){
            str = '<li >'
            str+='<div class="order-title">'
            str+='<h3 id="order_id">订单编号：'+data.orders[i].order_id+'</h3>'

            str+='<div class="fr order-operate">'+
                            '<button type="button" class="btn btn-success order-accept" data-toggle="modal" data-target="#accept-modal">接单</button>'
                            +'<button type="button" class="btn btn-danger order-reject" data-toggle="modal" data-target="#reject-modal">拒单</button>'
                        +'</div>'
            str+='</div><div class="order-content"><img src="/static/images/'+data.orders[i].image+'"><div class="order-text"><h3>'+data.orders[i].house_title+'</h3><ul>'
            str+='<li id="order_create_time">创建时间：'+data.orders[i].create_date+'</li>'
            str+='<li id="order_start_time">入住日期：'+data.orders[i].begin_date+'</li>'
            str+='<li id="order_end_time">离开日期：'+data.orders[i].end_date+'</li>'
            str+='<li id="order_amount">合计金额：'+data.orders[i].amount+'元(共'+data.orders[i].days+'晚)</li>'
            str+='<li>订单状态：<span id="order_status">'+data.orders[i].status+'</span></li>'
//            str+='<li>客户评价：'+data.orders[i].comment+'</li> </ul></div></div></li>'
            if(data.orders[i].comment){
                str+='<li>客户评价：'+data.orders[i].comment+'</li>'
            }
            if(data.orders[i].rejected){
            str += '<li>拒单原因：data.orders[i].rejected</li> '
            }
            str += '</ul></div></div></li>'
            $('.orders-list').append(str)
        }
    })
});