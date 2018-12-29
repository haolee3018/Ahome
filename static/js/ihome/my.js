function logout() {
    if (confirm("确认退出？")){
        $.get("/user/logout/", function(data){
            if (data.code == 200) {
                location.href = "/user/login/";
            }
        })
    }
}

function get_user(){
    $.get("/user/get_user/", function(data){
        if (data.code == 200){
            $('#user-mobile').text(data.data.phone);
            if (data.data.name){
                $('#user-name').text(data.data.name);
            }else{
                $('#user-name').text(data.data.phone);
            }
        }
    })
}




$(document).ready(function(){

    get_user()
})