// ------- Show news pages -------

let user = null

function viewNewsLibrary() {
    sessionStorage.setItem('current_view', 'viewNewsLibrary()')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')
    $("#container").load("/content/admin_pages/update_news/news_library.html", function () {
        $('#news-button').click(viewCreateNews) //kan inte ha något värde här, går då direkt till viewNewsEdit
        printNews()
    })
    updateCrumbs('newsLibrary')
}

function viewNewsEdit(newsID) {
    sessionStorage.setItem('current_view', 'viewNewsEdit('+ newsID + ')')
    updateCrumbs('newsEdit')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')

    $("#container").load("/content/admin_pages/update_news/news_edit.html", function () {
        fillNews(newsID)
        $('#submit-button').click(updateNewsPost(newsID))
    })
    // }
}

function viewCreateNews(){
    sessionStorage.setItem('current_view', 'viewCreateNews()')
    updateCrumbs('newsEdit')
    $("#container").load("/content/admin_pages/update_news/news_edit.html", function () {
        $('#submit-button').click(createNewsPost)
    })
}

function createNewsPost() {
    file = getFileFromInput($('#add-img-post'))
    if (file != null) {
        $.when(uploadFile(file, 'post_images/' + file.name)).done(function (imgURL) {
            const data = JSON.stringify({
                "title": $('#header-area').val(),
                "description": $('#text-area').val(),
                "posted_by": sessionStorage.getItem('uid'),
                "img": imgURL
            })
            addNews(data)
        })
    } else {
        const data = JSON.stringify({
            "title": $('#header-area').val(),
            "description": $('#text-area').val(),
            "posted_by": sessionStorage.getItem('uid')
        })
        addNews(data)
    }
}

// ------- Show news -------
function printNews() {
    $.ajax({
        type: 'GET',
        url: host + '/posts',
        contentType: "application/json",
        success: function (newsLibrary) {
            $('#bodyrow').empty()
            for (news of newsLibrary) {
                displayNews(news);
            }
            sortTable(1, 'news-archives')
            sortTable(1, 'news-archives')
        }
    });
}

function displayNews(news) {
    const year = news.post_time.substring(12, 16)
    const month = convertMonthToNumber(news.post_time.substring(8, 11))
    var day = news.post_time.substring(5, 7)
    var header = $('<td></td>').text(news.title)
    var time = $('<td></td>').text(year + '-' + month + '-' + day).addClass("can-disappear")
    var edit = $('<td></td>')
    var del = $('<td></td>')

    editButton = $('<button />').addClass('btn btn-outline-secondary edit-button').text('Redigera')
    editButton.attr('data-toggle', "modal")
    editButton.attr('data-whatever', news.id)
    editButton.attr('news-ID', news.id)
    editButton.attr('onclick', 'viewNewsEdit(' + news.id + ')')

    deleteButton = $('<button />').addClass('btn btn-outline-danger delete-button').text('Radera')
    deleteButton.attr('onclick', "showDeleteNewsModal(" + news.id + ")")

    edit.append(editButton)
    del.append(deleteButton)

    var tablerow = $("<tr></tr>")
    tablerow.append(header, time, edit, del)
    $("#bodyrow").append(tablerow)
    toggleResize() //removes elements with class can-dissapear
}

function fillNews(newsID) { //doesnt work, just go into new post mode and add new post not update current one
    $.ajax({
        type: 'GET',
        url: host + 'posts/' + newsID,
        contentType: 'application/json',
        success: function (newsPost) { //get the right newspost
            loadNewsInformation(newsPost)
        }
    })
}

function loadNewsInformation(post) {
    $('#header-area').val(post.title) //get the title of the post
    $('#text-area').val(post.description) //get the description of the post
}

// ------- Publish a new newspost -------
function updateNewsPost(newsID) {
    // this updates to fast
    posted_by = sessionStorage.getItem('uid')
    $('#submit-button').on('click', function (event) {
        file = getFileFromInput($('#add-img-post'))
        var today = new Date();
        var time = today.getFullYear() + "-" +
        + (today.getMonth() + 1) + "-"
        + today.getDate() + " " +
        + today.getHours() + ":"
        + today.getMinutes() + ":"
        + today.getSeconds()

        if (file != undefined){ // if user has added a file, it needs to be uploaded first
            $.when(uploadFile(file, 'post_images/' + file.name)).done(function (imgURL) {
                const data = JSON.stringify({
                    "title": $('#header-area').val(),
                    "description": $('#text-area').val(),
                    "edited_by": sessionStorage.getItem('uid'),
                    "post_time": time,
                    "img": imgURL
                })
                editNews(newsID, data)
            })
        } else {
            const data = JSON.stringify({
                "title": $('#header-area').val(),
                "description": $('#text-area').val(),
                "edited_by": sessionStorage.getItem('uid'),
                "post_time": time
            })
            editNews(newsID, data)
        }
    })
}

// ------- Edit, deleate, add news post -------
function editNews(newsID, data) {
    $.ajax({
        type: 'PUT',
        url: host + 'posts/' + newsID,
        contentType: "application/json",
        dataType: 'json',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: data,
        success: viewNewsLibrary
    });
}
function addNews(data) {
    $.ajax({
        type: 'POST',
        url: host + 'posts',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: data,
        success: viewNewsLibrary
    });
}
function deleteNews(newsID) {
    $.ajax({
        type: 'DELETE',
        url: host + 'posts/' + newsID,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: printNews
    });
}
function getUser() {
    return $.ajax({
        type: 'GET',
        url: host + 'member_id',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
    })
}

function showDeleteNewsModal(id){
    $('#confirm-delete-news-modal').modal('toggle')
    $('#confirm-delete-news-button').attr('news-id', id)

    $('#confirm-delete-news-button').click(function(event){
        deleteNews($(event.currentTarget).attr('news-id'))
        $('#confirm-delete-news-button').unbind()
    })
}