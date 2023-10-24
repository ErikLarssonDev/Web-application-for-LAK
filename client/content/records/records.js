function viewRecords() {
    sessionStorage.setItem('current_view', 'viewRecords()')
    updateCrumbs('records')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#navbarSupportedContent').find('span').removeClass('active-nav-link')
    $('#records-link').children().addClass('active-nav-link')
    $("#container").load("/content/records/records.html", function () {
        $.when(getRecords()).done(showRecords)
    });
}

function getRecords() {
    return $.ajax({
        type: "GET",
        url: host + "club_records",
        contentType: "application/json",
        error: function () {
            alert("kunde inte hämta rekord :(")
        }
    })
}

/* function getRecordsById() {
    return $.ajax({
        type: "GET",
        url: host + "/users/" + userid + "/club_records",
        contentType: "application/json",
        error: function () {
            alert("kunde inte hämta rekord :(")
        }
    })
} */

function showRecords(records) {
    showRecordsByCategory(records)
    showRecordsById(records)
}
function showRecordsByCategory(records) {
    for (const record of records) {
        var outermost = $('<div></div>').addClass('col')
        var outer = $('<div></div>').addClass('col').addClass('card').addClass('mb-3')
        var inner = $('<div></div>').addClass('record-body')
        var title = $('<h5></h5>').addClass('record-category').html(record.category)
        var category = $('<h6></h6>').html(record.record_holder)
        var accomplishment = $('<h6></h6>').html(record.accomplishment)
        inner.append(title).append(category).append(accomplishment)
        outermost.append(outer.append(inner))
        $('#record-holders').append(outermost)
    }
}

/* function showRecordsById(records) {
    for (idRec of records) {
        var outermost = $('<div></div>').addClass('col')
        var outer = $('<div></div>').addClass('col').addClass('card').addClass('mb-3')
        var inner = $('<div></div>').addClass('record-id-body')
        var title = $('<h5></h5>').addClass('record-id-title').html(idRec.record_holder)
        var category = $('<h6></h6>').html(idRec.category)
        var accomplishment = $('<h6></h6>').html(idRec.accomplishment)
        inner.append(title).append(category).append(accomplishment)
        outermost.append(outer.append(inner))
        $('#record-id-holders').append(outermost)
    }  
} */

// Unfinished, would be nice to sort records by record holder 