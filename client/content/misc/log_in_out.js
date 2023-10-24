//----------------------------------------------------------------------------------------
//-- LOG IN AND OUT ----------------------------------------------------------------------
//----------------------------------------------------------------------------------------

function failedLogin() {
    alert("Kunde inte logga in.")
}

function loginUser(response) {
    sessionStorage.setItem('auth', JSON.stringify(response['token'])); //token or response?
    sessionStorage.setItem('uid', response['user']['id'])
    var signedIn = sessionStorage.getItem('auth').length > 0
    if (signedIn) {
        //Try to find a better/more secure solution perhaps
        if (response['user'].is_admin) {
            sessionStorage.setItem('is_admin', true)
            $('#admin-item').toggleClass('d-none')
        } else {
            sessionStorage.setItem('is_admin', false)
        }
        $('#profile-item').toggleClass('d-none')
        $('#login-modal').modal('hide')
        $('#logout-item').toggleClass('d-none')
        $('#registration-item').toggleClass('d-none')
        $('#login-item').toggleClass('d-none')

        if (response['user'].is_admin) {
            viewAdmin()
        } else {
            viewProfile()
        }
    }
}

function login() {
    const email = $('#email-login').val()
    const password = $('#password-login').val()

    $.ajax({
        type: 'POST',
        url: host + 'log-in',
        contentType: 'application/json',
        data: JSON.stringify({
            "email": email,
            "password": password,
        }),
        success: loginUser,
        error: failedLogin
    })

    $('#email-login').val('')
    $('#password-login').val('')
}

// logs out the user, token needs to be cleared
function logout() {
    if (sessionStorage.getItem('is_admin') == "true") {
        $('#admin-item').toggleClass('d-none')
    }
    $('#profile-item').toggleClass('d-none')
    $('#logout-item').toggleClass('d-none')
    $('#registration-item').toggleClass('d-none')
    $('#login-item').toggleClass('d-none')
    sessionStorage.removeItem('auth')
    sessionStorage.removeItem('is_admin')
    viewHome();
}
//----------------------------------------------------------------------------------------
//-- END OF LOG IN AND OUT ---------------------------------------------------------------
