function hrefBack() {
    history.go(-1);
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

$(document).ready(function(){
    var keyword_url = location.search
    id = keyword_url.split('=')[1]
    $.get('/house/get_house_detail/' + id + '/', function(data){
        if(data.code == 200){
            if(data.booking == 0){
                $(".book-house").hide();
            }else{
                $(".book-house").show();
            }
            var images = data.data.images
            for(i=0; i < images.length; i++){
                h_img = '<li class="swiper-slide"><img src="/static/media/' + images[i] +'"></li>'
                $('.swiper-wrapper').append(h_img)
            }
            var mySwiper = new Swiper ('.swiper-container', {
                loop: true,
                autoplay: 2000,
                autoplayDisableOnInteraction: false,
                pagination: '.swiper-pagination',
                paginationType: 'fraction'
            })

            $('.house-price span').text(data.data.price)
            $('.house-title').text(data.data.title)
            $('.landlord-pic').html('<img src="/static/media/' + data.data.user_avatar + '">')
            $('.landlord-name span').text(data.data.user_name)
            $('.text-center li').text(data.data.address)
            h_info_1 = '<h3>出租' + data.data.room_count + '间</h3><p>房屋面积:' + data.data.acreage + '平米</p><p>房屋户型:' + data.data.unit + '</p>'
            $('#house-info-1 div').html(h_info_1)
            $('#house-info-2 div').html('<h3>宜住' + data.data.capacity + '人</h3>')
            $('#house-info-3 div').html('<h3>卧床配置</h3><p>' + data.data.beds + '</p>')
            $('#deposit-min-max').html('<li>收取押金<span>' + data.data.deposit + '</span></li><li>最少入住天数<span>' + data.data.min_days + '</span></li><li>最多入住天数<span>' + data.data.max_days + '</span></li>')
            var facilities = data.data.facilities
            for (i=0; i < facilities.length; i++){
                fac_info = '<li><span class="' + facilities[i].css + '"></span>' + facilities[i].name + '</li>'
                $('.house-facility-list').append(fac_info)
            }
        }
    })


})