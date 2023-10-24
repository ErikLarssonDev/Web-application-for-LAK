function viewGetEmails() {
    updateCrumbs('newsletter')
    sessionStorage.setItem('current_view', 'viewGetEmails()')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')
    $("#container").load("/content/admin_pages/newsletter/newsletter.html", function () {
      //  const emailList = getEmails()
        loadEmails()

    });

}


function loadEmails() {
    $.ajax({
        type: 'GET',
        url: host + '/emails',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: function(response) {
            for(const email of response) {
                $('#email-textarea').append(email + "; ")
            }
        }
    })
}