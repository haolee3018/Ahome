function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){});
        },1000)
    });
}


function get_area_facility_info(){
    $.get('/house/area_facility_info/', function(data){
        if(data.code == 200){
            for (i=0; i<data.data.length; i++){
                //  <option value=""></option>
                area_str = '<option value="' + data.data[i].id + '">' + data.data[i].name + '</option>'
                $('#area-id').append(area_str)
            }

            for (i=0; i<data.data_1.length; i++){
                facility_str = '<li><div class="checkbox"><label>'
                facility_str += '<input type="checkbox" name="facility" value="' + data.data_1[i].id + '">'
                facility_str += data.data_1[i].name + '</label></div></li>'
                $('.house-facility-list').append(facility_str)
            }
        }
    })
}




$(document).ready(function(){
    // $('.popup_con').fadeIn('fast');
    // $('.popup_con').fadeOut('fast');

    get_area_facility_info();

    $('#form-house-info').submit(function(e){
        e.preventDefault();
        $(this).ajaxSubmit({
            url: '/house/newhouse/',
            type: 'POST',
            dataType: 'json',
            success: function(data){
                if(data.code == 200){
                    $('#form-house-info').hide();
                    $('#form-house-image').show();
                    $('#house-id').val(data.data)
                }
            },
            error: function(data){
                alert('提交失败')
            }
        })
    })

    $('#form-house-image').submit(function(e){
        e.preventDefault();
        $(this).ajaxSubmit({
            url: '/house/newhouse_image/',
            type: 'POST',
            dataType: 'json',
            success: function(data){
                if(data.code == 200){
                    $('#house-image-show').attr('src','/static/media/' + data.data)
                        var img = '<img src="/static/media/' + data.data + '" style="width:300px !important;height:200px;">'
                    $('.house-image-cons').append(img);
                    showSuccessMsg();
                }
            },
            error: function(data){
                alert('上传失败')
            }
        })
    })
})