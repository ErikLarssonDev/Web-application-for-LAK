//---------------------------------------------------------------------------------
//-- PROFILE VIEW -----------------------------------------------------------------
//---------------------------------------------------------------------------------
function viewProfile() {
    $("#container").load("/content/member_pages/my_profile.html", function () {
        viewProfilePage()
        loadProfileButtons()
    })
}

// used when a view in the profile pages is to be loaded. If the user
// refreshes, profile-page-content does not exists and the whole page
// has to be loaded first.
function loadProfileView(fileToLoad, viewToLoad) {
    if ($("#profile-page-content").length > 0) {
        $("#profile-page-content").load("/content/member_pages/" + fileToLoad, viewToLoad)
    } else {
        $("#container").load("/content/member_pages/my_profile.html", function () {
            loadProfileButtons()
            $("#profile-page-content").load("/content/member_pages/" + fileToLoad, viewToLoad)
        })
    }
    $.when(getUser()).done(showProfile)
}

function loadProfileButtons() {
    $('#2nd-profile-button').on("click", function (e) {
        e.preventDefault()
        viewProfilePage()
    })
    $('#booking-button').on("click", function (e) {
        e.preventDefault()
        viewProfileBooking()
    })
    $('#membership-button').on("click", function (e) {
        e.preventDefault()
        viewProfileMembership()
    })
    $('#payment-button').on("click", function (e) {
        e.preventDefault()
        viewProfilePayment()
    })
    $('#settings-button').on("click", function (e) {
        e.preventDefault()
        viewProfileSettings()
    })
}

function getCurrentPage() {
    $(document).click(function() {
        $(this).addClass('active-button')
    })
}

// ------------------------------------------------

function getUser() {
    return $.ajax({
        type: "GET",
        url: host + "users/" + sessionStorage.getItem('uid'),
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) }
    })
}

function getUserMemberships() {
    $.ajax({
        type: "GET",
        url: host + "user/" + sessionStorage.getItem('uid') + "/memberships",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) }
    })
}

function showProfile(user) {
    $('#profile-page-content-header').html('<span class="fa fa-user"></span>' + '  ' + user['first_name'] + ' ' + user['last_name'])
    if (user['newsletter']) {
        $('#member-newsletter').attr('checked', true)
    }

}


// wait with this
// function showProfileMemberships(memberships){
//     for (const membership of memberships){
//         var listItem = $('<li></li>').html(membership.title)
//         $('#profile-memberships').append(listItem)
//     }
// }





function toggleFields(disabled) {
    $('#member-info-form').find('input').each(function () {
        $(this).attr('disabled', disabled)
    })

    $('#update-member-button').toggleClass('d-none')
    $('#cancel-update-member-button').toggleClass('d-none')
    $('#edit-profile-button').toggleClass('d-none')
}
//-- END OF PROFILE VIEW -----------------------------------------------------------------
//----------------------------------------------------------------------------------------
