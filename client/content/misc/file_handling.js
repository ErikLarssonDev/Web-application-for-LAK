// this function uploads a file to firebase db and returns the url
// file is a file fetched from a form in html, see addYearFile in
// edit_site_info for reference. Path is the filepath to be used in
// firebase ("example board_member_images/an_image.jpg")
function uploadFile(file, path) {
    data = new FormData();
    data.append('image', file)
    data.append('file_path', path)

    return $.ajax({
        type: "POST",
        url: host + "images",
        contentType: false,
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data: data,
        processData: false,
        error: function () {
        }
    })
}

// fetches all file categories from db
function getCategories(){
    return $.ajax({
        type: "GET",
        url: host + "file_categories",
        contentType: "application/json",
    })
}

// checks if a certain category name exists, call for this function
// when after getCategories are done (pass response from getCategories
// to this)
function categoryExists(categoryName, categories) {
    for (const category of categories) {
        if (category.name == categoryName) { return category.id }
    }
    return null
}

// fetches all files categories from db, showTheFiles is a callback
// function that uses the files returned from db. For examle
// appends the files to some list or table in html.
function getFilesInCategory(categoryID, showTheFiles){
    console.log(categoryID)
    $.ajax({
        type: "GET",
        url: host + "files/file_category/" + categoryID,
        contentType: "application/json",
        success: showTheFiles,
        error: function () {
            alert('filerna i kategorin ' + categoryID + ' hittades inte')
        }
    })
}

function createFile(file, url, categoryID, successFunction){
    $.ajax({
        type: "POST",
        url: host + "files",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data: JSON.stringify({
            "name": file.name,
            "src": url,
            "category": categoryID
        }),
        success: successFunction,
        error: function () {
            alert("fil kunde inte skapas")
        }
    })
}

function getFileFromInput(inputElement){
    return (inputElement[0].files[0])
}