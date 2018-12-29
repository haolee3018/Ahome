function hrefBack() {
    history.go(-1);
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

function showErrorMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function(){
    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    $(".input-daterange").on("changeDate", function(){
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();

        if (startDate && endDate && startDate > endDate) {
            showErrorMsg();
        } else {
            var sd = new Date(startDate);
            var ed = new Date(endDate);
            days = (ed - sd)/(1000*3600*24) + 1;
            var price = $(".house-text>p>span").html();
            var amount = days * parseFloat(price);
            $(".order-amount>span").html(amount.toFixed(2) + "￥(共"+ days +"晚)");
        }
    });
    id = location.search.split('=')[1]
    $.ajax({
        url:'/order/get_booking_house/',
        datatype:'json',
        type:'post',
        data:{'id':id},
        success:function(data){
            if(data.code == 200){
                for(i=0;i<data.houses.length;i++){
                    var id = data.houses[i].id
                    var title = data.houses[i].title
                    var price = data.houses[i].price
                    var image = data.houses[i].image
                    $("#house_img").attr('src','/static/images/'+image)
                    $('#house_title').html(title)
                    $('#price').html(price)
                }
                $('#order_amount').hide()
                $('#order_amount').val(price)
            }
        }
    })
})
