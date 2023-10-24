function viewPasswordReset() {
    //updatecrumbs('reset_password')
    $('#container').load("/content/misc/reset_password.html")
}

function blablabla() {
    const email = $('#forgotten-password-email').val();

    $.ajax({
        type: 'POST',
        url: host + 'forgot-password',
        contentType: 'application/json',
        data: JSON.stringify({
            "email": email
        }),
        success: function() {
            alert("En länk har skickats till din e-post")
            location.reload()
        }
    })
}
