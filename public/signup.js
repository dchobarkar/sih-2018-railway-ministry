window.onload = function(){
    var txtPassword = document.getElementById("txtPassword");
    var txtConfirmPassword = document.getElementById("txtConfirmPassword");
    txtPassword.onchange = ConfirmPassword;
    txtConfirmPassword.onkeyup = ConfirmPassword;
    function ConfirmPassword(){
        txtConfirmPassword.setCustomValidity("");
        if (txtPassword.value != txtConfirmPassword.value){
            txtConfirmPassword.setCustomValidity("Passwords do not match.");
        }
    }
}