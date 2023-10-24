function viewProfilePage() {
    sessionStorage.setItem('current_view', 'viewProfilePage()')

    loadProfileView("member_profile.html", function () {
        $.when(getUser()).done(fillProfileInformation)
        //sidebar content -- can färga knappar men inte avfärga dem 
        $('#sidebar-content').find('button').each(function () {
            $(this).removeClass('active-button')
        })
        $('#sidebar-content').find('button').removeClass('active-button')
        $('#2nd-profile-button').addClass('active-button')
    })

    $('#navbarSupportedContent').find('li').each(function () {
        $(this).children().removeClass('active-nav-link')
    })
    $('#profile-item').children().addClass('active-nav-link')
    $('#profile-logo').addClass('active-nav-link')
    $('#admin-logo').removeClass('active-nav-link')
    updateCrumbs('profile')
}

function fillProfileInformation(user) {
    $('#profile-page-content-header').html(
        '<span class="fa fa-user"></span>' + '  ' +
        user['first_name'] + ' ' + user['last_name'])
    $('#full-name').html(user['first_name'] + ' ' + user['last_name'])
    $('#member-address').html(user['address'])
    $('#member-zipcode').html(user['zip_code'])
    $('#member-city').html(user['district'])
    $('#member-email').html(user['email'])
    $('#member-phone').html(user['tel'])

    if (user['newsletter']) {
        $('#member-newsletter').attr('checked', true)
    }

    //Tag information

    if (user.tag != null) {
        // getUserTag(user)
        //console.log(user.tag.active_until)
        tagExpireDate = user.tag.active_until
        $('#tag-title').html("Tagg (" + user.tag.id + ") aktiv till")
        tagDate = new Date(tagExpireDate)
        formattedDate = showTime(tagDate)
        $('#member-tag').html(formattedDate)
    } else {
        $('#tag-title').html("Inga aktiva taggar")
    }

    toggleFields(true)

}

function getUserTag(user) {
    $.ajax({
        type: "GET",
        url: host + "users/" + sessionStorage.getItem('uid') + '/tags',
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function (tag) {
            tagExpireDate = tag.active_until
            $('#tag-title').html("Tagg aktiv till")
            formattedDate = showTime(tagExpireDate)
            $('#member-tag').html(formattedDate)
        }
    })

}