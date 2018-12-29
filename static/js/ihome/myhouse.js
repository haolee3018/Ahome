

$(document).ready(function(){
    $.get('/house/get_house_info/', function(data){
        if(data.code == 200){
            $('.auth-warn').hide()
            $('#houses-list').show()
            for(var i=0; i<data.data.length; i++){
                var house = ''
                house += '<li><a href="/house/detail/?house_id=' + data.data[i].id + '">'
                house += '<div class="house-title">'
                house += '<h3>房屋ID:' + data.data[i].id + '—————' + data.data[i].title + '</h3></div>'
                house += '<div class="house-content">'
                house += '<img alt="" src="/static/media/' + data.data[i].image + '">'
                house += '<div class="house-text"><ul>'
                house += '<li>位于：' + data.data[i].area + '</li>'
                house += '<li>价格：￥' + data.data[i].price + '/晚</li>'
                house += '<li>发布时间：' + data.data[i].create_time + '</li>'
                house += '</ul></div></div></a></li>'
                $('#houses-list').append(house)
            }
        }else{
            $('.auth-warn').show()
            $('#houses-list').hide()
        }
    })
})