//admin
function viewAdmin() {
    sessionStorage.setItem('current_view', 'viewAdmin()')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')

    $("#container").load("/content/admin_pages/admin_start.html", function () {
        $('#handle-members-button').click(viewMembers)
        $('#handle-memberships-button').click(viewMembershipLibrary)
        $('#update-news-button').click(viewNewsLibrary)
        $('#get-emails-button').click(viewGetEmails)
        $('#handle-bookings-button').click(viewHandleBookings)
        $('#site-info-button').click(viewEditSiteInfo)
        $('#edit-design-button').click(viewEditDesign)
        $('#edit-tags-button').click(viewTags)
        $('#show-payments-button').click(viewAllPayments)
        $('#reset-db-true').click(resetDb)

    })
    updateCrumbs('admin')
}

function resetDb(){
    $.ajax({
        type: "POST",
        url: host + "reset-db",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function () {
            sessionStorage.clear()
            window.location.reload()
        }
    })
}