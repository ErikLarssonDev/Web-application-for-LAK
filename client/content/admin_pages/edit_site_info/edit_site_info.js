function viewEditSiteInfo() {
    sessionStorage.setItem('current_view', 'viewEditSiteInfo()')
    updateCrumbs('editInfo')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')
    $("#container").load("/content/admin_pages/edit_site_info/edit_site_info.html", function () {
        toggleResize()
        $.when(getClubInfo()).done(showEditClubInfo)
        $.when(getOpeningHours()).done(showOpeningHoursTable)
        $.when(getBoardMembers()).done(showBoardMembersTable)
        $.when(getFAQ()).done(showAdminFAQ)


        $.when(getCategories()).done(function (categories) {
            getProtocols(categories, showAdminProtocols)
            getFeatureImages(categories, showAdminFeatureImages)
            getPolicy(categories, showAdminPolicy)

        })
        // opening-hour-modal stuff
        $('#opening-hour-modal').on('show.bs.modal', function (event) {
            addOpeningHourInfo(event)
        })
        $('#opening-hour-modal').on('hide.bs.modal', function (event) {
            $('opening-hour-open').css('outline', '')
            $('#opening-hour-close').css('outline', '')
            $('#opening-hour-close-feedback').html("")
        })
        $('#update-opening-hour-button').click(updateOpeningHour)

        // end opening-hour-modal stuff

        $('#update-board-member-button').click(updateBoardMember)
        $('#add-year-file-button').click(addYearFile)
        $('#add-policy-file-button').click(addPolicyFile)

        $('#add-board-member-button').click(addBoardMember)
        $('#delete-board-member-button').click(showDeleteModal)

        $('#add-feature-image-button').click(addFeatureImage)
        $('#send-faq-button').click(addFaq)

        $('#update-faq-button').click(updateFaq)
        $('#delete-faq-button').click(showDeleteFaqModal)
        $('#confirm-deletion-faq').click(deleteFaq)


        $('#board-member-modal').on('show.bs.modal', function (event) {
            addBoardMemberInfo(event)
        })
        $('.modal').on('hide.bs.modal', function () {
            clearBoardMemberModal()
        })

    });
    // updateCrumbs('settings')
}

// Ajax call GETs the association info
function getClubInfo() {
    return $.ajax({
        type: "GET",
        url: host + "associations",
        contentType: "application/json",
        error: function () {
            // alert("kunde inte hämta företagsuppgifterna :(")
        }
    })
}

// Fills the Openinghours table with current info.
function showOpeningHoursTable(openingHours) {
    var boardTableOpeningHours = $('#opening-hour-table')
    for (const openingHours1 of openingHours) {
        var row = $('<tr></tr>')
        var day = $('<th></th>').html(openingHours1.day)
        var openening = $('<td></td>').html(openingHours1.open_time + " - " + openingHours1.close_time).addClass('can-disappear')

        // adds openinghours info to button so it can be appended to modal
        var buttonColumn = $('<td></td>').addClass('text-right')
        var editButton1 = $('<button></button>').attr('type', 'button').html('Redigera')
        editButton1.addClass('btn btn-outline-secondary mt-1 p-2')
        editButton1.attr('opening-hour-day', openingHours1.day)
        editButton1.attr('opening-hour-open', openingHours1.open_time)
        editButton1.attr('opening-hour-close', openingHours1.close_time)
        editButton1.attr('data-toggle', 'modal').attr('data-target', '#opening-hour-modal')
        buttonColumn.append(editButton1)
        row.append(day, openening, buttonColumn)
        boardTableOpeningHours.append(row)
    }
    toggleResize()
} 

function addOpeningHourInfo(event) {
    $('#opening-hour-day').val($(event.relatedTarget).attr('opening-hour-day'))
    $('#opening-hour-open').val($(event.relatedTarget).attr('opening-hour-open'))
    $('#opening-hour-close').val($(event.relatedTarget).attr('opening-hour-close'))
    $('#update-opening-hour-button').attr('opening-hour-day', $(event.relatedTarget).attr('opening-hour-day'))
}

function updateOpeningHour(event) {
    const openingHourDay = $(event.currentTarget).attr('opening-hour-day')

    const array1 = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    openingHourDayIndex = 1 + (array1.indexOf(openingHourDay)); // Grotesk lösning men vet inte hur man jobbar i detta språk

    const data1 = JSON.stringify({
        "day": $('#opening-hour-day').val(),
        "open_time": $('#opening-hour-open').val(),
        "close_time": $('#opening-hour-close').val()
    })
  
    if (validateTimeOpenAfterClose($('#opening-hour-open').val(), $('#opening-hour-close').val())) {
        $('opening-hour-open').css('outline', '')
        $('#opening-hour-close').css('outline', '')
        $('#opening-hour-close-feedback').html("")
        putOpeningHour(data1, openingHourDayIndex)
    } else {
        $('opening-hour-open').css('outline', '2px solid red')
        $('#opening-hour-close').css('outline', '2px solid red')
        $('#opening-hour-close-feedback').html("<p class='text-danger'>Öppningstid måste vara före stängningstid!</p>")
    }
}

function validateTimeOpenAfterClose(openTime, closeTime) {
    if (parseInt(openTime.slice(0,2)) < parseInt(closeTime.slice(0,2))) {
        return true
    } else if (parseInt(openTime.slice(0,2)) == parseInt(closeTime.slice(0,2))) {
        if (parseInt(openTime.slice(3,5)) < parseInt(closeTime.slice(3,5))) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

function putOpeningHour(data, selectedDay) {
    $.ajax({
        type: "PUT",
        url: host + "opening_hours/" + selectedDay,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data: data,
        success: function () {
            $('#opening-hour-table').empty()
            $.when(getOpeningHours()).done(showOpeningHoursTable)
            $('#opening-hour-modal').modal('hide')
        },
    })
}

// End of Openinghours table get and put

// Fills the Contactinfo content with current info.

function showEditClubInfo(association) {
    for (const association1 of association) {
        $('#editClubName').val(association1.name)
        $('#editClubEmail').val(association1.email)
        $('#editClubPhone').val(association1.tel)
        $('#editClubAddress').val(association1.address)
        $('#editClubZipcode').val(association1.zip_code)
        $('#editClubDistrict').val(association1.district)
        $('#editClubInstagram').val(association1.instagram)
        $('#editClubFacebook').val(association1.facebook)
        $('#saveEditedClubButton').click(editClubInfo)
    }
}

// Ajax call PUTs the associations info within the boxes
// #TODO Fix contact email?

function editClubInfo() {
    $.ajax({
        type: "PUT",
        url: host + "/associations/" + 1, // Do we have more than 1 association?
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: JSON.stringify({
            'name': $('#editClubName').val(),
            "email": $('#editClubEmail').val(),
            "tel": $('#editClubPhone').val(),
            "address": $('#editClubAddress').val(),
            "zip_code": $('#editClubZipcode').val(),
            "district": $('#editClubDistrict').val(),
            "instagram": $('#editClubInstagram').val(),
            "facebook": $('#editClubFacebook').val(),
        }),
        success: function () {
            alert("Great Success")
        },
        error: function () {
            alert("kunde inte ändra företagsuppgifter :(")
        }
    })
}

function deleteBoardMember(event) {
    const id = $(event.currentTarget).attr('board-member-id')

    $.ajax({
        type: "DELETE",
        url: host + "board_members/" + id,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function () {
            $('#board-members-table').empty()
            $.when(getBoardMembers()).done(showBoardMembersTable)
            $('#board-member-modal').modal('hide')
            $('#confirm-deletion-board-member').unbind()
        }
    })
}

function showDeleteModal(event) {
    $('#board-member-modal').modal('toggle')
    $('#confirm-delete-board-member-modal').modal('toggle')

    $('#confirm-deletion-board-member').click(function () {
        deleteBoardMember(event)
    })
}

function getBoardMembers() {
    return $.ajax({
        type: "GET",
        url: host + "board_members",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) }
    })
}

function showBoardMembersTable(boardMembers) {

    var boardTable = $('#board-members-table')
    for (const boardMember of boardMembers) {
        var row = $('<tr></tr>')
        var name = $('<th></th>').attr('scope', 'row').html(boardMember.name)
        var title = $('<td></td>').html(boardMember.title).addClass('can-disappear')
        var email = $('<td></td>').html(boardMember.email).addClass('can-disappear')

        var buttonColumn = $('<td></td>').addClass('text-right')
        // adds board member info to button so it can be appended to modal
        var editButton = $('<button></button>').attr('type', 'button').html('Redigera')
        editButton.addClass('btn btn-outline-secondary mt-1 p-2')
        editButton.attr('board-member-id', boardMember.id)
        editButton.attr('board-member-name', boardMember.name)
        editButton.attr('board-member-email', boardMember.email)
        editButton.attr('board-member-img', boardMember.img)
        editButton.attr('board-member-title', boardMember.title)
        editButton.attr('data-toggle', 'modal').attr('data-target', '#board-member-modal')
        buttonColumn.append(editButton)
        if ($(window).width() > 750) {
            row.append(name, title, email, buttonColumn)
        } else {
            row.append(name, editButton)
        }
        
        boardTable.append(row)
    }
    toggleResize()
}

//adds a new board member
function addBoardMember() {
    if ($('#add-board-member-file-upload')[0].files[0] != undefined) {
        const file = $('#board-member-file-upload')[0].files[0]
        const path = file.name
        $.when(uploadFile(file, path)).done(function (imgURL) {
            const data = JSON.stringify({
                "name": $('#add-board-member-name').val(),
                "title": $('#add-board-member-title').val(),
                "email": $('#add-board-member-email').val(),
                "img": imgURL
            })
            postBoardMember(data)
        })
    } else {
        const data = JSON.stringify({
            "name": $('#add-board-member-name').val(),
            "title": $('#add-board-member-title').val(),
            "email": $('#add-board-member-email').val()
        })
        postBoardMember(data)
    }
}

function postBoardMember(data) {
    $.ajax({
        type: "POST",
        url: host + "board_members",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data: data,
        success: function () {
            $('#board-members-table').empty()
            $.when(getBoardMembers()).done(showBoardMembersTable)
            $('#add-board-member-modal').modal('hide')
        }
    })
}

//updates an old board member
function updateBoardMember(event) {
    const boardMemberID = $(event.currentTarget).attr('board-member-id')

    if ($('#board-member-file-upload')[0].files[0] != null) {
        const file = $('#board-member-file-upload')[0].files[0]
        const path = file.name

        $.when(uploadFile(file, path)).done(function (imgURL) {
            const data = JSON.stringify({
                "name": $('#board-member-name').val(),
                "title": $('#board-member-title').val(),
                "email": $('#board-member-email').val(),
                "img": imgURL
            })
            putBoardMember(data, boardMemberID)
        })
    } else {
        const data = JSON.stringify({
            "name": $('#board-member-name').val(),
            "title": $('#board-member-title').val(),
            "email": $('#board-member-email').val()
        })
        putBoardMember(data, boardMemberID)
    }
}

function putBoardMember(data, id) {
    $.ajax({
        type: "PUT",
        url: host + "board_members/" + id,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data: data,
        success: function () {
            $('#board-members-table').empty()
            $.when(getBoardMembers()).done(showBoardMembersTable)
            $('#board-member-modal').modal('hide')
        }
    })
}

function addBoardMemberInfo(event) {
    if ($(event.relatedTarget).attr('board-member-img') != null) {
        $('#board-member-modal-img').attr('src', $(event.relatedTarget).attr('board-member-img'))
    }
    $('#board-member-name').val($(event.relatedTarget).attr('board-member-name'))
    $('#board-member-title').val($(event.relatedTarget).attr('board-member-title'))
    $('#board-member-email').val($(event.relatedTarget).attr('board-member-email'))
    $('#update-board-member-button').attr('board-member-id', $(event.relatedTarget).attr('board-member-id'))
    $('#delete-board-member-button').attr('board-member-id', $(event.relatedTarget).attr('board-member-id'))
}

function clearBoardMemberModal() {
    if ($('#board-member-modal-img').attr('src') != null) {
        $('#board-member-modal-img').removeAttr('src')
    }
    $('.modal-form').val('')
}

function addYearFile() {
    $.when(getCategories()).done(function (categories) {
        const categoryID = categoryExists('year-protocol', categories)
        if (categoryID != null) {
            const file = $('#add-year-file-upload')[0].files[0]
            if (file != null) {
                if (filenameIsCorrect(file.name)) {
                    const path = 'year_protocols/' + file.name
                    $.when(uploadFile(file, path)).done(function (fileURL) {
                        createFile(file, fileURL, categoryID, viewEditSiteInfo)
                    })
                } else {
                    alert("Filnamnet måste vara på formatet 'årsmöte_YYYY-MM-DD.pdf'")
                }
            }
        } else {
        }
    })
}

function filenameIsCorrect(filename) {
    const partOfName = filename.slice(filename.length - 14, filename.length - 4)
    for (let i = 0; i < partOfName.length; i++) {
        if (i == 4 || i == 7) {
            if (partOfName[i] != '-') { return false }
        } else {
            if (!(partOfName[i] >= '0' && partOfName[i] <= '9')) { return false }
        }
    }
    return true
}

function showAdminProtocols(protocols) {
    if (protocols != undefined) {
        const sortedProtocols = protocols.sort(compareProtocols)
        for (const protocol of sortedProtocols) {
            var row = $('<tr></tr>')

            var link = $('<a></a>').attr('href', protocol.src).attr('target', 'blank')
            link.addClass('file-name-resize')
            link.attr('file-name', protocol.name)

            if ($(window).width() < 750 && protocol.name.length > 10) {
                link.html(protocol.name.slice(0,10) + '...')
            } else {
                link.html(protocol.name)
            }
            link.addClass('col')
            var col1 = $('<td></td>').attr('scope', 'row').html(link)

            var deleteButton = $('<button></button>').attr('type', 'button').html('Radera')
            deleteButton.addClass('btn btn-outline-danger mt-auto p-2')
            deleteButton.attr('file-id', protocol.id)
            deleteButton.click(showDeleteFileModal)
            // editButton.attr('data-toggle', 'modal').attr('data-target', '#board-member-modal')
            var col2 = $('<td></td>').attr('scope', 'row').addClass('text-right').html(deleteButton)

            row.append(col1).append(col2)
            $('#year-protocols-table-admin').append(row)
        }
        toggleFileNameResize()
    }
}

function deleteProtocol(event) {
    const fileToDelete = $(event.currentTarget).attr('file-id')
    $.ajax({
        type: "DELETE",
        url: host + "files/" + fileToDelete,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function () {
            viewEditSiteInfo()
        }
    })
}

function showDeleteFileModal(event) {
    $('#confirm-delete-file-modal').modal('toggle')

    $('#confirm-deletion-file').click(function () {
        $('#confirm-delete-file-modal').on('hidden.bs.modal', function () {
            deleteProtocol(event)
            $('#confirm-delete-file-modal').unbind()
        })
        $('#confirm-delete-file-modal').modal('toggle')
    })
}

function getFeatureImages(categories, showImages) {
    const categoryID = categoryExists('feature-image', categories)
    getFilesInCategory(categoryID, showImages)
}

function showAdminFeatureImages(images) {
    for (const image of images) {
        var row = $('<tr></tr>')

        link = $('<a></a>').attr('href', image.src).attr('target', 'blank')
        link.addClass('file-name-resize')
        link.attr('file-name', image.name)
        link.html(image.name)
        link.addClass('col')
        var col1 = $('<td></td>').attr('scope', 'row').html(link)

        var deleteButton = $('<button></button>').attr('type', 'button').html('Radera')
        deleteButton.addClass('btn btn-outline-danger mt-auto mr-1')
        deleteButton.attr('file-id', image.id)
        deleteButton.click(showDeleteFileModal)
        // editButton.attr('data-toggle', 'modal').attr('data-target', '#board-member-modal')
        var col2 = $('<td></td>').attr('scope', 'row').addClass('text-right').html(deleteButton)

        row.append(col1).append(col2)
        $('#feature-images-table-admin').append(row)
    }
    toggleFileNameResize
}

function addFeatureImage() {
    $.when(getCategories()).done(function (categories) {
        const categoryID = categoryExists('feature-image', categories)
        if (categoryID != null) {
            const file = $('#add-feature-img-upload')[0].files[0]
            if (file != null) {
                const path = 'feature_images/' + file.name
                $.when(uploadFile(file, path)).done(function (imgURL) {
                    createFile(file, imgURL, categoryID, viewEditSiteInfo)
                })
            }
        }
    })
}

function addPolicyFile() {
    $.when(getCategories()).done(function (categories) {
        const categoryID = categoryExists('policy-file', categories)
        if (categoryID != null) {
            const file = $('#add-policy-file-upload')[0].files[0]
            if (file != null) {
                const path = 'policy_file/' + file.name
                $.when(uploadFile(file, path)).done(function (fileURL) {
                    createFile(file, fileURL, categoryID, viewEditSiteInfo)
                })

            }
        } else {
        }
    })
}

function showAdminPolicy(policy) {
    for (const policy1 of policy) {
        var row = $('<tr></tr>')
        link = $('<a></a>').attr('href', policy1.src).attr('target', 'blank')
        link.addClass('file-name-resize')
        link.attr('file-name', policy1.name)
        link.html(policy1.name)
        link.addClass('col')
        var col1 = $('<td></td>').attr('scope', 'row').html(link)

        var deleteButton = $('<button></button>').attr('type', 'button').html('Radera')
        deleteButton.addClass('btn btn-outline-danger mt-auto mr-1 p-2')
        deleteButton.attr('file-id', policy1.id)
        deleteButton.click(showDeleteFileModal)
        var col2 = $('<td></td>').attr('scope', 'row').addClass('text-right').html(deleteButton)

        row.append(col1).append(col2)
        $('#policy-table-admin').append(row)
    }
    toggleFileNameResize()
}

function showAdminFAQ(faqs){
    $('#admin-faq-table').empty()
    for (const faq of faqs){
        var row = $('<tr></tr>')
        var col1 = $('<td></td>').html(faq.question)
        var col2 = $('<td></td>').addClass('text-right')
        var editButton = $('<button></button>').attr('type', 'button').html('Redigera')
        editButton.addClass('btn btn-outline-secondary mt-1 p-2')
        editButton.attr('data-toggle', 'modal').attr('data-target', '#edit-faq-modal')
        editButton.attr('faq-question', faq.question)
        editButton.attr('faq-answer', faq.answer)
        editButton.attr('faq-id', faq.id)
        editButton.click(addFaqInfo)
        col2.append(editButton)
        row.append(col1, col2)
        $('#admin-faq-table').append(row)
    }
}

function addFaqInfo(event){
    $('#edit-faq-question').val($(event.currentTarget).attr('faq-question'))
    $('#edit-faq-answer').val($(event.currentTarget).attr('faq-answer'))
    $('#update-faq-button').attr('faq-id', $(event.currentTarget).attr('faq-id'))
    $('#delete-faq-button').attr('faq-id', $(event.currentTarget).attr('faq-id'))
}

function addFaq(){
    $.ajax({
        type: "POST",
        url: host + "FAQs",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: JSON.stringify({
            'question': $('#add-faq-question').val(),
            "answer": $('#add-faq-answer').val()
        }),
        success: function(){
            $.when(getFAQ()).done(showAdminFAQ)

        },
        error: function () {
            alert("kunde inte ladda upp faq :(")
        }
    })
}

function updateFaq(event){
    $.ajax({
        type: "PUT",
        url: host + "FAQs/" + $(event.currentTarget).attr('faq-id'),
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: JSON.stringify({
            'question': $('#edit-faq-question').val(),
            "answer": $('#edit-faq-answer').val()
        }),
        success: function(){
            $.when(getFAQ()).done(showAdminFAQ)

        },
        error: function () {
            alert("kunde inte ladda upp faq :(")
        }
    })
}

function showDeleteFaqModal(event){
    $('#confirm-delete-faq-modal').modal('toggle')
    $('#confirm-deletion-faq').attr('faq-id', $(event.currentTarget).attr('faq-id'))
}

function deleteFaq(event){
    $.ajax({
        type: "DELETE",
        url: host + "FAQs/" + $(event.currentTarget).attr('faq-id'),
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: function(){
            $.when(getFAQ()).done(showAdminFAQ)

        },
        error: function () {
            alert("kunde inte ladda upp faq :(")
        }
    })
}