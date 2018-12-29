var cur_page = 1; // 当前页
var next_page = 1; // 下一页
var total_page = 1;  // 总页数
var house_data_querying = true;   // 是否正在向后台获取数据

// 解析url中的查询字符串
function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}
function url(search){
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

// 更新用户点选的筛选条件
function updateFilterDateDisplay() {
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var $filterDateTitle = $(".filter-title-bar>.filter-title").eq(0).children("span").eq(0);
    if (startDate) {
        var text = startDate.substr(5) + "/" + endDate.substr(5);
        $filterDateTitle.html(text);
    } else {
        $filterDateTitle.html("入住日期");
    }


}


// 更新房源列表信息
// action表示从后端请求的数据在前端的展示方式
// 默认采用追加方式
// action=renew 代表页面数据清空从新展示
function updateHouseData(action) {
    var areaId = $(".filter-area>li.active").attr("area-id");
    if (undefined == areaId) areaId = "";
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var sortKey = $(".filter-sort>li.active").attr("sort-key");
    var params = {
        aid:areaId,
        sd:startDate,
        ed:endDate,
        sk:sortKey,
        p:next_page
    };
    //发起ajax请求，获取数据，并显示在模板中
}

$(document).ready(function(){
    var queryData = decodeQuery();
    var startDate = queryData["sd"];
    var endDate = queryData["ed"];
    $("#start-date").val(startDate);
    $("#end-date").val(endDate);
    updateFilterDateDisplay();

    var areaName = queryData["aname"];
    if (!areaName) areaName = "位置区域";
    $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html(areaName);

    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    var $filterItem = $(".filter-item-bar>.filter-item");
    $(".filter-title-bar").on("click", ".filter-title", function(e){
        var index = $(this).index();
        if (!$filterItem.eq(index).hasClass("active")) {
            $(this).children("span").children("i").removeClass("fa-angle-down").addClass("fa-angle-up");
            $(this).siblings(".filter-title").children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).addClass("active").siblings(".filter-item").removeClass("active");
            $(".display-mask").show();
        } else {
            $(this).children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).removeClass('active');
            $(".display-mask").hide();
            updateFilterDateDisplay();
        }
    });
    $(".display-mask").on("click", function(e) {
        $(this).hide();
        $filterItem.removeClass('active');
        updateFilterDateDisplay();
        cur_page = 1;
        next_page = 1;
        total_page = 1;
        updateHouseData("renew");
        var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
        msg = $('#msgss').val()
        msg = url(msg)
        msg['sd']=startDate
        msg['ed']=endDate
//        location.href = '/house/search/?aid='+msg["aid"]+'&sd='+msg["sd"]+'&ed='+msg["ed"]+'&sort_key='+msg["sort_key"]
        update(msg)

    });
    $(".filter-item-bar>.filter-area").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html($(this).html());
        } else {
            $(this).removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html("位置区域");
        }
        msg = $('#msgss').val()
        msg = url(msg)
        area = $(this).attr('area-id')
        msg['aid']=area
//        location.href = '/house/search/?aid='+msg["aid"]+'&sd='+msg["sd"]+'&ed='+msg["ed"]+'&sort_key='+msg["sort_key"]
        update(msg)
    });
    $(".filter-item-bar>.filter-sort").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $(".filter-title-bar>.filter-title").eq(2).children("span").eq(0).html($(this).html());
        }
        msg = $('#msgss').val()
        msg = url(msg)
        sort_key = $(this).attr('sort-key')
        msg['sort_key']=sort_key
//        location.href = '/house/search/?aid='+msg["aid"]+'&sd='+msg["sd"]+'&ed='+msg["ed"]+'&sort_key='+msg["sort_key"]
        update(msg)

    })
    msg = decodeQuery()
    update(msg)


    $.get('/house/get_area/',function(data){
        area = data.area
        for(i=0;i<area.length;i++){
            $('.filter-area').append('<li  area-id="'+(i+1)+'">'+area[i]+'</li>')
        }

    })
})


function update(msg){

    $.ajax({
        url:'/house/search/',
        type:'post',
        datatype:'json',
        data:msg,
        success:function(data){
            if(data.code !=200){
                $('.house-list').html(data.msg+'<input type="hidden" value = "?aid='+msg["aid"]+'&sd='+msg["sd"]+'&ed='+msg["ed"]+'&sort_key='+msg["sort_key"]+'" id="msgss">')
            }
            else{
                 houses = data.houses
            $('.house-list').html('')
            for(i=0;i<houses.length;i++){
                str = '<li class="house-item">'+
                    '<input type="hidden" value = "?aid='+msg["aid"]+'&sd='+msg["sd"]+'&ed='+msg["ed"]+'&sort_key='+msg["sort_key"]+'" id="msgss">'+
                    '<a href="/house/detail/?id='+houses[i].id+'" id="images_list'+i+'"></a>'+
                    '<div class="house-desc">'+
                    '<div class="landlord-pic"><img src="/static/images/'+houses[i].user_avatar+'"></div>'+
                    '<div class="house-price">￥<span>'+houses[i].price+'</span>/晚</div>'+
                    '<div class="house-intro">'+
                    '<span class="house-title">'+houses[i].title+'</span>'+
                    '<em>出租'+houses[i].room_count+'间 - '+houses[i].num+'次入住 - '+houses[i].address+'</em>'+
                    '</div></div></li>'
                $('.house-list').append(str)
                images = houses[i].images

//                for(m=0;m<images.length;m++){
                    $('#images_list'+i).html('<img src="/static/images/'+images[0]+'">')

//                }

            }
            }

        }
    })
}