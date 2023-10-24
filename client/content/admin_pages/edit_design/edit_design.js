function viewEditDesign() {
    updateCrumbs('editDesign')
    sessionStorage.setItem('current_view', 'viewEditDesign()')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')
    $("#container").load("/content/admin_pages/edit_design/edit_design.html", function () {
        loadColors()
        $('#update-colors-button').click(updateColors)
    });
}

function addImage() {
    const file = $('#association-file-upload')[0].files[0]
    const path = file.name
    $.when(uploadFile(file, path)).done(function (imgURL) {
        alert("uploadFile(file, path)")
        const data = JSON.stringify({
            "img": imgURL
        })
        postImage(data)
    })
}
function postImage(data) {
    $.ajax({
        type: "PUT",
        url: host + "/associations/"+1,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data : data,
        success: function () {
        },
        error: function () {
        }
    })
}

function loadColors(){
    $('#primary-color-input').val(document.documentElement.style.getPropertyValue("--primary-color"))
    $('#secondary-color-input').val(document.documentElement.style.getPropertyValue("--secondary-color"))
}

function updateColors(){
    $.ajax({
        type: "PUT",
        url: host + "/associations/"+1,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data : JSON.stringify({
            "primary_color" : $('#primary-color-input').val(),
            "secondary_color" : $('#secondary-color-input').val()

        }),
        success: setColors,
        error: function () {
        }
    })
}