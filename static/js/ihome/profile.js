
function hrefBack() {
    history.go(-1);
}

function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function get_user(){
    $.get("/user/get_user/", function(data){
        if (data.code == 200){
            if (data.data.avatar){
                $('#user-avatar').attr('src', '/static/media/' + data.data.avatar);
            };
            if (data.data.name){
                $('#user-name').attr('placeholder', data.data.name);
            };
        }
    })
}

$(document).ready(function(){
    get_user();

    $('#form-avatar').submit(function(e){
        e.preventDefault();
        $(this).ajaxSubmit({
            url: '/user/profile/',
            dataType: 'json',
            type: 'PATCH',
            success: function(data){
                if (data.code == 200){
                    showSuccessMsg()
                    $('#user-avatar').attr('src', '/static/media/' + data.data)
                }
            }
        })
    });
    $('#form-name').submit(function(e){
        e.preventDefault();
        var user_name = $('#user-name').val()
        if (user_name){
            $(this).ajaxSubmit({
                url: '/user/profile/',
                data: {'user_name': user_name},
                dataType: 'json',
                type: 'POST',
                success: function(data){
                    if (data.code == 200){
                        showSuccessMsg()
                        $('#user-name').attr('placeholder', data.data)
                    }
                },
                error: function(data){
                    alert('修改失败')
                }
            })
        }
    });
})