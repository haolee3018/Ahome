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
    $(".order-comment").on("click", function(){
        var orderId = $(this).parents("li").attr("order-id");
        $(".modal-comment").attr("order-id", orderId);
    });

    $.get('/order/get_myorders/',function(data){
        for(i=0;i<data.orders.length;i++){
            str = '<li order-id="'+data.orders[i].order_id+'">'
            str+='<div class="order-title">'
            str+='<h3 id="order_id">订单编号：'+data.orders[i].order_id+'</h3>'
            str+='<div class="fr order-operate"><button type="button" id="say_comment" class="btn btn-success order-comment" data-toggle="modal" data-target="#comment-modal">发表评价</button></div>'
            str+='</div><div class="order-content"><img src="/static/images/'+data.orders[i].image+'"><div class="order-text"><h3>订单</h3><ul>'
            str+='<li id="order_create_time">创建时间：'+data.orders[i].create_date+'</li>'
            str+='<li id="order_start_time">入住日期：'+data.orders[i].begin_date+'</li>'
            str+='<li id="order_end_time">离开日期：'+data.orders[i].end_date+'</li>'
            str+='<li id="order_amount">合计金额：'+data.orders[i].amount+'元(共'+data.orders[i].days+'晚)</li>'
            str+='<li>订单状态：<span id="order_status">'+data.orders[i].status+'</span></li>'
            if(data.orders[i].comment){
                str+='<li>我的评价：'+data.orders[i].comment+'</li>'
            }
            if(data.orders[i].rejected){
            str += '<li>拒单原因：data.orders[i].rejected</li> '
            }
            str += '</ul></div></div></li>'
            $('.orders-list').append(str)
        }
    })
});