function viewProfileSettings() {
    sessionStorage.setItem('current_view', 'viewProfileSettings()')

    $('#navbarSupportedContent').find('li').each(function () {
        $(this).children().removeClass('active-nav-link')
    })
    $('#profile-item').children().addClass('active-nav-link')
    $('#profile-logo').addClass('active-nav-link')
    $('#admin-logo').removeClass('active-nav-link')
    updateCrumbs('profileSettings')

    loadProfileView('member_settings.html', function () {
        $('#profile-page-content-header').html('Inställningar')
        //sidebar content -- can färga knappar men inte avfärga dem 
        $('#sidebar-content').find('button').each(function () {
            $(this).removeClass('active-button')
        })
        $('#sidebar-content').find('button').removeClass('active-button')
        $('#settings-button').addClass('active-button')
        $.ajax({
            type: 'GET',
            url: host + '/users/' + sessionStorage.getItem('uid'),
            headers: {
                "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
            },
            success: (function (user) {
                loadUserInfo(user)
                toggleFields(true)
            })
        })
    })
}

function loadUserInfo(user) {
    $('#member-first-name').val(user['first_name'])
    $('#member-last-name').val(user['last_name'])
    $('#member-address').val(user['address'])
    $('#member-zipcode').val(user['zip_code'])
    $('#member-city').val(user['district'])
    $('#member-email').val(user['email'])
    $('#member-phone').val(user['tel'])

    if (user['newsletter']) {
        $('#member-newsletter').attr('checked', true)
    }
    $('#edit-profile-button').click(editProfile)
}

function deleteProfile() {
    var id = sessionStorage.getItem('uid')

    $.ajax({
        type: "DELETE",
        url: host + "users/" + id,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function () {
            logout()
            viewHome()
        }
    })
}

function showDeleteProfileModal(id) {
    $('#confirm-delete-profile-modal').modal('toggle')
    $('#confirm-delete-profile-button').attr('member-id', id)

    $('#confirm-delete-profile-button').click(function (event) { //should 'event' even be here?? it is not used
        $('#confirm-delete-profile-button').unbind()
        $('.modal-backdrop').remove()
        deleteProfile() //correct way to get member-id????
    })
}

function viewMemberAgain() {
    // toggleFields(true)
    $('#update-member-button').unbind()
    $('#cancel-update-member-button').unbind()
    viewProfileSettings()
}


function editProfile() {
    toggleFields(false)
    $('#update-member-button').click(function (event) {
        event.preventDefault()
        updateMember(sessionStorage.getItem('uid'))
    })
    $('#cancel-update-member-button').click(function (event) {
        event.preventDefault()
        viewMemberAgain()
    })
}

function updateMember(id) { //TODO, fix so that an empty string is not sent when the field is not filled in
    $.ajax({                     // or fix so that the users current data is filled in automatically to avoid sending
        type: "PUT",             // empty strings 
        url: host + "users/" + id,
        contentType: 'application/json',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: JSON.stringify({
            "first_name": nullWhenEmpty($('#member-first-name').val()),
            "last_name": nullWhenEmpty($('#member-last-name').val()),
            "address": nullWhenEmpty($('#member-address').val()),
            "zip_code": nullWhenEmpty($('#member-zipcode').val()),
            "district": nullWhenEmpty($('#member-city').val()),
            "email": nullWhenEmpty($('#member-email').val()),
            "tel": nullWhenEmpty($('#member-phone').val()),
            "newsletter": $('#member-newsletter').is(':checked')
        }),
        success: viewMemberAgain(),
        error: function () {
            alert("gick inte att uppdatera")
        }
    })
}
