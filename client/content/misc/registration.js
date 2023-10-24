
//----------------------------------------------------------------------------------------
//-- REGISTRATION ------------------------------------------------------------------------
//----------------------------------------------------------------------------------------
function registerCustomer() {
    if (signUpValidInputs() == true) {
        zipCode = $('#zipcode-input').val().replace(/\s+/g, '');


        $.ajax({
            type: 'POST',
            url: host + '/sign-up',
            contentType: 'application/json',
            data: JSON.stringify({
                "pnr": $('#pn-date-input').val() + "-" + $('#pn-numbers-input').val(),
                "first_name": $('#first-name-input').val(),
                "last_name": $('#last-name-input').val(),
                "address": $('#reg-address-input').val(),
                "zip_code": zipCode,
                "district": $('#city-input').val(),
                "tel": $('#tel-input').val(),
                "email": $('#email-input').val(),
                "password": $('#password-input').val(),
                "newsletter": true
            }),
            success: function (resp) {
                loginUser(resp)
                $('#registration-modal').modal('toggle')

            }
        })
    }
}

function signUpValidInputs() {
    var isValid = true
    if ($('#gdpr-accept').is(':checked')) {
        $('#gdpr-accept').css('outline', '')
    } else {
        $('#gdpr-accept').css('outline', '2px solid red')
        isValid = false
    }
    if (isValidPnumber($('#pn-date-input').val() + $('#pn-numbers-input').val()) == true) {
        $('#pn-date-input').css('outline', '2px solid green')
        $('#pn-numbers-input').css('outline', '2px solid green')
    } else {
        $('#pn-date-input').css('outline', '2px solid red')
        $('#pn-numbers-input').css('outline', '2px solid red')
        isValid = false // Commenting this out to make testing easier
    }
    if ($('#first-name-input').val() != "") {
        $('#first-name-input').css('outline', '2px solid green')
    } else {
        $('#first-name-input').css('outline', '2px solid red')
        isValid = false
    }
    if ($('#last-name-input').val() != "") {
        $('#last-name-input').css('outline', '2px solid green')
    } else {
        $('#last-name-input').css('outline', '2px solid red')
        isValid = false
    }
    if ($('#zipcode-input').val().match(/^ ?[0-9]+ ?[0-9]+ ?$/) != null) {
        $('#zipcode-input').css('outline', '2px solid green')
    } else if ($('#zipcode-input').val() == "") {
        $('#zipcode-input').css('outline', '')
    } else {
        $('#zipcode-input').css('outline', '2px solid red')
        isValid = false
    }
    if ($('#tel-input').val().match(/^[0-9]+$/) != null) {
        $('#tel-input').css('outline', '2px solid green')
    } else if ($('#tel-input').val() == "") {
        $('#tel-input').css('outline', '')
    } else {
        $('#tel-input').css('outline', '2px solid red')
        isValid = false
    }
    if ($('#email-input').val() == $('#email-input-repeat').val() && $('#email-input').val() != "") {
        $('#email-input').css('outline', '2px solid green')
        $('#email-input-repeat').css('outline', '2px solid green')
    } else {
        $('#email-input').css('outline', '2px solid red')
        $('#email-input-repeat').css('outline', '2px solid red')
        isValid = false
    }
    if ($('#password-input').val() == $('#password-input-repeat').val() && $('#password-input').val() != "") {
        $('#password-input').css('outline', '2px solid green')
        $('#password-input-repeat').css('outline', '2px solid green')
        $('#password-input-repeat-feedback').html("")
    } else {
        $('#password-input').css('outline', '2px solid red')
        $('#password-input-repeat').css('outline', '2px solid red')
        $('#password-input-repeat-feedback').html("<p class='text-danger'>Lösenord matchar inte!</p>")
        isValid = false
    }
    return isValid

}

function isDate(year, month, day) {
    month = month - 1
    var tmpDate = new Date(year, month, day)
    if ((getYear(tmpDate.getYear()) == year) &&
        (month == tmpDate.getMonth()) &&
        (day == tmpDate.getDate()))
        return true
    else
        return false
}

function isValidPnumber(pNumber) {
    var numbers = pNumber.slice(2, 12)
    var checkSum = 0

    if (!isDate(pNumber.substring(0, 4), pNumber.substring(4, 6), pNumber.substring(6, 8))) {
        return false
    }

    var n
    for (var i = 0; i < 10; i++) {
        n = parseInt(numbers[i])
        if (i % 2 == 0) {
            checkSum += (n * 2) % 9 + Math.floor(n / 9) * 9
        } else {
            checkSum += n
        }
    }
    if (checkSum % 10 == 0) { return true }
    return false
}

function getYear(y) { return (y < 1000) ? y + 1900 : y }

function showGDPR() {
    // maybe keep this
    // $('.modal').unbind()

    // $('#registration-modal').modal('toggle')
    // $('#gdpr-modal').modal('toggle')
    // $('#gdpr-modal').on('hide.bs.modal', function(){
    //     $('#registration-modal').modal('toggle')
    //     $('.modal').on('hide.bs.modal', function(){
    //         $('.modal-form').val('')
    //         $('.modal-form').prop('checked', false)
    //     })
    // })
}
//-- END OF REGISTRATION -----------------------------------------------------------------
//----------------------------------------------------------------------------------------