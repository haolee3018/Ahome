
function goBack(){
    history.go(-1);
}

function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

function get_user_auth(){
    $.get("/user/get_user_auth/", function(data){
        if (data.code == 200){
                $('#real-name').attr('placeholder', data.data.id_name).attr('disabled', 'disabled');
                $('#id-card').attr('placeholder', data.data.id_card).attr('disabled', 'disabled');
                $('.btn-success').hide();
        }
    })
}

$(document).ready(function(){
    $('#form-auth').submit(function(e){
        e.preventDefault();
        var real_name = $('#real-name').val()
        var id_card = $('#id-card').val()
        if (!(real_name && id_card )){
            $('.error-msg').show()
        }
        else{
            $(this).ajaxSubmit({
                url: '/user/auth/',
                data: {'real_name': real_name, 'id_card': id_card},
                dataType: 'json',
                type: 'POST',
                success: function(data){
                    if(data.code == 200){
                        showSuccessMsg();
                        location.href = '/user/auth/';
                    }
                },
                error: function(data){
                    alert('提交失败')
                }
            })
        }

    })

    get_user_auth();
})