host = 'http://localhost:3000/' //Changed to port 3000 because MacOS no longer accepts port 5000

$(document).ready(function () {
    loadTheSite()
})

function loadTheSite(){
    $.when(getContactData()).done(setColors)

    if (sessionStorage.getItem('auth') != null) {
        $('#registration-item').toggleClass('d-none')
        $('#login-item').toggleClass('d-none')
        
        if (sessionStorage.getItem('is_admin') != "true") {
            $('#admin-item').toggleClass('d-none')
        }
    } else {
        $('#logout-item').toggleClass('d-none')
        $('#profile-item').toggleClass('d-none')
        $('#admin-item').toggleClass('d-none')
    }

    for (const l of $('nav').find('.nav-item')) {
        l.addEventListener('click', () => {
            if ($(window).width() < 992) { // 992px is breaking point for navbar-expand-lg
                $('#navbarSupportedContent').collapse('toggle')
            }
        })
    }

    // $('#navbarSupportedContent').collapse('toggle')

    createBreadcrumbs()
    window.addEventListener('resize', toggleResize)
    window.addEventListener('resize', toggleFileNameResize)
    //cursor is loading when waiting for ajax-response
    $(document).ajaxStart(function () {
        $('body').css({ cursor: 'wait' })
    })
    $(document).ajaxStop(function () {
        $('body').css({ cursor: 'auto' })
    })

    // checks what view should be loaded
    if (window.location.href.indexOf("token") > -1) {
        viewPasswordReset()
    } else if (window.location.href.indexOf("paymentsuccess") > -1) {
        viewCheckoutCompletion()
    } else if (sessionStorage.getItem('current_view') == null) {
        viewHome()
    } else {
        eval(sessionStorage.getItem('current_view'))
    }

    loadLogo()
    loadTabLogo()
    loadModals()
    addNavTargets()
    addNavTargetsFooter()
    getInfoFooter()
}

function addNavTargets() {
    $('#logo').click(viewHome)
    $('#home-button').click(viewHome)
    $('#about-button').click(viewAbout)
    $('#profile-button').click(viewProfile)
    $('#admin-button').click(viewAdmin)
    $('#logout-button').click(logout)
    $('#faq-button').click(viewFaq)
    $('#contact-button').click(viewContact)
    $('#events-button').click(viewEvents)
    $('#records-button').click(viewRecords)

}

function addNavTargetsFooter() {
    $('#home-button-footer').append($('<a href=#!>Hem</a>')).click(viewHome)
    $('#gdpr-button-footer').append($('<a href=#!>GDPR</a>')).click(showGDPRFooter)
    $('#protocols-button-footer').append($('<a href=#!>Årsmöteshandlingar</a>')).click(viewProtocols)

    $('#about-button-footer').append($('<a href=#!>Om oss</a>')).click(viewAbout)
    $('#contact-button-footer').append($('<a href=#!>Kontakt</a>')).click(viewContact)

    $('#signup-button-footer').append($('<a href=#!>Registrera</a>'))
    $('#login-button-footer').append($('<a href=#!>Logga in</a>'))
    $('#events-button-footer').append($('<a href=#!>Eventkalender</a>')).click(viewEvents)

}

// Loads the logo, will fetch from db when backend-features are added. 
// Is now added check function loadAssociationInfo at the bottom. Change the logo in the adminpage edit_design.html
function loadLogo() {
    var height = $('#nav').height();
    $('#logo-img').attr("src", "images/logo-wbg.png")
    $('#logo-img').height(height * 0.6)
}

function loadTabLogo() {
    $('#tab-logo').attr("href", "/images/logo-wbg.png")
}

function loadModals() {
    $('.modal-form').val('')
    $('.modal-form').prop('checked', false)
    $('#send-login-button').click(login)
    // $('#gdpr-link').click(showGDPR) // maybe keep

    $.when(getCategories()).done(function (categories) {
        id = categoryExists('policy-file', categories)
        getFilesInCategory(id, function (file) {
            if (file != undefined) {
                $('#gdpr-link').attr('href', file.src)
            }
        })
    })

    $('.modal').on('hidden.bs.modal', function () {
        $('.modal-form').val('')
        $('.modal-form').prop('checked', false)
        $('#pn-date-input').css('outline', '')
        $('#pn-numbers-input').css('outline', '')
        $('#first-name-input').css('outline', '')
        $('#last-name-input').css('outline', '')
        $('#zipcode-input').css('outline', '')
        $('#tel-input').css('outline', '')
        $('#email-input').css('outline', '')
        $('#email-input-repeat').css('outline', '')
        $('#password-input').css('outline', '')
        $('#password-input-repeat').css('outline', '')
        $('#password-input-repeat-feedback').html("")
    })

    $("#pn-date-input").keyup(function () {
        if (this.value.length == this.maxLength) {
            $('#pn-numbers-input').focus()
        }
    })

    $("#pn-numbers-input").keyup(function () {
        if (this.value.length == this.maxLength) {
            $('#first-name-input').focus()
        }
    })

    $("#zipcode-input").keyup(function () {
        if (this.value.length == this.maxLength) {
            $('#city-input').focus()
        }
    })

    $('#gdpr-accept').click(function () {
        if ($(this).is(':checked')) {
            $('#gdpr-accept').css('outline', 'none')
        }
    })

    $('#email-input').on("input blur", function(e) {
        if ($('#email-input').val() == $('#email-input-repeat').val() && $('#email-input').val() != "") {
            $('#email-input').css('outline', '2px solid green')
            $('#email-input-repeat').css('outline', '2px solid green')
        } else {
            $('#email-input').css('outline', '2px solid red')
            $('#email-input-repeat').css('outline', '2px solid red')
        }
    });
   
    $('#email-input-repeat').on("input blur", function(e) {
        if ($('#email-input').val() == $('#email-input-repeat').val() && $('#email-input').val() != "") {
            $('#email-input').css('outline', '2px solid green')
            $('#email-input-repeat').css('outline', '2px solid green')
        } else {
            $('#email-input').css('outline', '2px solid red')
            $('#email-input-repeat').css('outline', '2px solid red')
        }
    });

    $('#password-input').on("input blur", function(e) {
        if ($('#password-input').val() == $('#password-input-repeat').val() && $('#password-input').val() != "") {
            $('#password-input').css('outline', '2px solid green')
            $('#password-input-repeat').css('outline', '2px solid green')
            $('#password-input-repeat-feedback').html("")
        } else {
            $('#password-input').css('outline', '2px solid red')
            $('#password-input-repeat').css('outline', '2px solid red')
            $('#password-input-repeat-feedback').html("<p class='text-danger'>Lösenord matchar inte!</p>")
        }
    });
   
    $('#password-input-repeat').on("input blur", function(e) {
        if ($('#password-input').val() == $('#password-input-repeat').val() && $('#password-input').val() != "") {
            $('#password-input').css('outline', '2px solid green')
            $('#password-input-repeat').css('outline', '2px solid green')
            $('#password-input-repeat-feedback').html("")
        } else {
            $('#password-input').css('outline', '2px solid red')
            $('#password-input-repeat').css('outline', '2px solid red')
            $('#password-input-repeat-feedback').html("<p class='text-danger'>Lösenord matchar inte!</p>")
        }
    });


    
}

function toggleResize() {
    if ($(window).width() < 750) {
        $('.can-disappear').addClass('d-none')
    } else {
        $('.can-disappear').removeClass('d-none')
    }
    if ($(window).width() < 750){
        $('.image-div-resize').removeClass('flex-row').removeClass('flex-nowrap')
        $('.image-div-resize').addClass('flex-column')
        $('.image-div-resize img').addClass('align-self-center')
        $('.image-div-resize img').removeClass('align-self-start')
    } else {
        $('.image-div-resize').removeClass('flex-column')
        $('.image-div-resize').addClass('flex-row flex-nowrap')
        $('.image-div-resize img').addClass('align-self-start')
        $('.image-div-resize img').removeClass('align-self-center')
    }
}

function toggleFileNameResize() {
    const elements = $('#container').find('.file-name-resize')
    if ($(window).width() < 750) {
        for (const element of elements) {
            if ($(element).attr('file-name').length > 10) {
                $(element).html($(element).attr('file-name').slice(0, 10) + '...')
            }
        }
    } else {
        for (const element of elements) {
            $(element).html($(element).attr('file-name'))
        }
    }
}

function getInfoFooter() {
    $("#footer").load("/client", function () {
        $.when(getContactData()).done(loadAssociationInfo)
        $.when(getOpeningHours()).done(loadOpeninghoursToFooter)
        $.when(getCategories()).done(function (categories) {
            getPolicy(categories, showPolicy)
        })
    });
}
function loadAssociationInfo(association1) {
    for (const association of association1) {

        $('#lka-header-footer').append(association.name)
        $('#footer-copyright-content').append(association.name)

        //Loads logo from db, code is working just for everyone without logo in their db to have a nice logo to checkout. :)
        /* var height = $('#nav').height();
        $('#logo-img').attr("src", association.img);
        $('#logo-img').height(height);
         */

        var associationFooterItem = $('<div></div>').addClass('contact contact-items mb-3 mt-4 p-0 d-flex flex-wrap')
        var associationFacebook = $('<p><a href="' + association.facebook + '"><i class="fa fa-facebook-square"></i>' + (association.facebook).substr(25, (association.facebook.length - 26)) + '</a></p>')
        var associationInstagram = $('<p><a href="' + association.instagram + '"><i class="fa fa-instagram"></i>' + (association.instagram).substr(26, (association.instagram.length - 27)) + '</a></p>')

        var associationAdressItem = $('<p><a><i class="fa fa-home"></i>' + association.address + " " + association.zip_code + " " + association.district + '</a></p>')

        var associationEmail = $('<p><a href="mailto:' + association.email + '"><i class="fa fa-envelope-o"></i>' + association.email + '</a></p>')
        var associationPhone = $('<p><a href="tel:' + association.tel + '"><i class="fa fa-phone"></i>' + (association.tel).substr(0, 3) + "-" + (association.tel).substr(4, 10) + '</a></p>')

        associationFooterItem.append(associationFacebook).append(associationInstagram).append(associationAdressItem).append(associationEmail).append(associationPhone)
        $('#lower-section-footer').append(associationFooterItem)
    }
}
function loadOpeninghoursToFooter(openingHours) {
    var openingHours1Item = $('<div></div>')
    var openingHours1Content = $('<p></p>')
    var hourArray = []
    for (const dailyOpeningHour of openingHours) {
        hourArray.push(dailyOpeningHour)
    }
    for (let i = 0; i < 7; i++) {
        if (i == 6) {
            openingHours1Content.append(createOpeningHoursFooter(hourArray[i]))
        }
        else if (hourArray[i].open_time != hourArray[i + 1].open_time || hourArray[i].close_time != hourArray[i + 1].close_time) {
            openingHours1Content.append(createOpeningHoursFooter(hourArray[i]))
        } else {
            for (let j = i + 1; j < 7; j++) {
                if (j == 6) {
                    openingHours1Content.append(createCombinedOpeningHoursFooter(hourArray[i], hourArray[j]))
                    i = 8
                }
                else if (hourArray[i].open_time == hourArray[j].open_time && hourArray[i].close_time == hourArray[j].close_time && (hourArray[i].open_time != hourArray[j + 1].open_time || hourArray[i].close_time != hourArray[j + 1].close_time)) {
                    openingHours1Content.append(createCombinedOpeningHoursFooter(hourArray[i], hourArray[j]))
                    i = j
                    break
                }
            }
        }
    }
    openingHours1Item.append(openingHours1Content)
    $('#footer-opening-hours-content').append(openingHours1Item)
}

function getPolicy(categories, showPolicy) {
    var categoryID
    for (const category of categories) {
        if (category.name == "policy-file") { categoryID = category.id }
    }
    if (categoryID != undefined) {
        getFilesInCategory(categoryID, showPolicy)
    }
}

function createCombinedOpeningHoursFooter(dailyOpeningHours1, dailyOpeningHours2) {
    var openingHoursFooterTable = $('<tbody></tbody>')
    var row = $('<tr></tr>')
    var day = $('<td></td>').html('<p>' + dailyOpeningHours1.day + " - " + dailyOpeningHours2.day + ": " + '</p>')
    var openening = $('<td></td>').html('<p>' + dailyOpeningHours1.open_time + " - " + dailyOpeningHours1.close_time + '</p>')
    row.append(day).append(openening)
    openingHoursFooterTable.append(row)
    return openingHoursFooterTable
}

function createOpeningHoursFooter(dailyOpeningHours) {
    var openingHoursFooterTable = $('<tbody></tbody>')
    var row = $('<tr></tr>')
    var day = $('<td></td>').html('<p>' + dailyOpeningHours.day + ": " + '</p>')
    var openening = $('<td></td>').html('<p>' + dailyOpeningHours.open_time + " - " + dailyOpeningHours.close_time + '</p>')
    row.append(day).append(openening)
    openingHoursFooterTable.append(row)
    return openingHoursFooterTable
}

function showPolicy(policy) {
    if (policy != undefined) {
        for (const policy1 of policy) {
            link = $('<a></a>').attr('href', policy1.src).attr('target', 'blank')
            link.html("Integritetspolicy")
            $('#policy-button-footer').append(link)
        }
    }
}
function showGDPRFooter() {
    $('#gdpr-modal').modal('toggle')
}
