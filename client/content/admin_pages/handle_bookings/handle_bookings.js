function viewHandleBookings() {
    sessionStorage.setItem('current_view', 'viewHandleBookings()')
    $("#container").load("/content/admin_pages/handle_bookings/handle_bookings.html", function () {
        $('#add-booking-button').click(openNewBookingModal)
        $.when(getAllEvents()).done(showAdminEvents)
        $('#delete-event-button').click(showDeleteEventModal)
        $('#edit-event-button').click(editEvent)
        toggleResize()
        $('#confirm-unbook-user').click(unbookTheUser)
        $('#registered-modal').on('hide.bs.modal', function (event) {
            if ($(event.target).attr('hasChanged') == 'true') {
                $(event.target).attr('hasChanged', false)
                $.when(getAllEvents()).done(showAdminEvents)
            }
        })
    })
    updateCrumbs('handleBookings')
}

function openNewBookingModal() {
    $('#add-event-modal').modal('show')
}

function addEvent() {
    $.ajax({
        type: "POST",
        url: host + "events",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data: JSON.stringify({
            "title": $('#add-event-title-input').val(),
            "description": $('#add-event-description-input').val(),
            "price": parseInt($('#add-event-price-input').val()) || 0,
            "available_spots": $('#add-event-spots-input').val(),
            "start_datetime": $('#add-event-start-date-input').val() + ' ' + $('#add-event-start-time-input').val() + ':00',
            "end_datetime": $('#add-event-end-date-input').val() + ' ' + $('#add-event-end-time-input').val() + ':00',

        }),
        success: function () {
            $('#events-admin-table').empty()
            $.when(getAllEvents()).done(showAdminEvents)
        }
    })
}

function showAdminEvents(events) {
    $('#events-admin-table').empty()
    // events.sort(compareEvents)
    // for (const event of events) {
    for (event of events) {
        createAdminEvent(event)
    }
    sortTable(0, 'view-member-bookings-table')
    // sortTableBookings(1)
    toggleResize()
}

// function sortTableBookings(n) {
//     var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
//     // table = document.getElementById("members-table");
//     table = document.getElementById('view-member-bookings-table');
//     switching = true;
//     // Set the sorting direction to ascending:
//     dir = "asc";
//     /* Make a loop that will continue until
//     no switching has been done: */
//     while (switching) {
//         // Start by saying: no switching is done:
//         switching = false;
//         rows = table.rows;
//         /* Loop through all table rows (except the
//         first, which contains table headers): */
//         for (i = 1; i < (rows.length - 1); i++) {
//             // Start by saying there should be no switching:
//             shouldSwitch = false;
//             /* Get the two elements you want to compare,
//             one from current row and one from the next: */
//             x = rows[i].getElementsByTagName("TD")[n];
//             y = rows[i + 1].getElementsByTagName("TD")[n];
//             /* Check if the two rows should switch place,
//             based on the direction, asc or desc: */
//             if (dir == "asc") {
//                 if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
//                     // If so, mark as a switch and break the loop:
//                     shouldSwitch = true;
//                     break;
//                 }

//             } else if (dir == "desc") {
//                 if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
//                     shouldSwitch = true;
//                     break;
//                 }
//             }
//         }
//         if (shouldSwitch) {
//             /* If a switch has been marked, make the switch
//             and mark that a switch has been done: */
//             rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
//             switching = true;
//             // Each time a switch is done, increase this count by 1:
//             switchcount++;
//         } else {
//             /* If no switching has been done AND the direction is "asc",
//             set the direction to "desc" and run the while loop again. */
//             if (switchcount == 0 && dir == "asc") {
//                 dir = "desc";
//                 switching = true;
//             }
//         }
//     }

// }


function createAdminEvent(event) {
    var row = $('<tr></tr>')
    var title = $('<td></td>').text(event.title)//html(event.title)
    var sdate = new Date(event.start_datetime)
    var fsdate = showTime(sdate)
    var start = $('<td></td>').text(fsdate).addClass('can-disappear')
    //var start = $('<td></td>').html(createDate(event.start_datetime)).addClass('can-disappear')

    var edate = new Date(event.end_datetime)
    var fedate = showTime(edate)
    var end = $('<td></td>').text(fedate).addClass('can-disappear')


    //var end = $('<td></td>').html(createDate(event.end_datetime)).addClass('can-disappear')
    var price = $('<td></td>').text(event.price + 'kr').addClass('can-disappear')
    var spots = $('<td></td>').text(event.available_spots).addClass('can-disappear')


    var RegisteredMembersButton = $('<button></button>').attr('type', 'button').html('Visa anmälda')
    RegisteredMembersButton.addClass('btn btn-outline-secondary mt-1 p-2')
    RegisteredMembersButton.attr('event-id', event.id)
    RegisteredMembersButton.attr('event-title', event.title)
    RegisteredMembersButton.click(openMembersTableModal)
    var registeredMembersCol = $('<td></td>').html(RegisteredMembersButton).addClass('text-right')

    // adds openinghours info to button so it can be appended to modal
    var editButton = $('<button></button>').attr('type', 'button').html('Redigera')
    editButton.addClass('btn btn-outline-secondary mt-1 p-2')
    editButton.attr('event-id', event.id)
    editButton.attr('event-title', event.title)
    editButton.attr('event-description', event.description)
    editButton.attr('event-price', event.price)
    editButton.attr('event-spots', event.available_spots)
    editButton.attr('event-start', event.start_datetime)
    editButton.attr('event-end', event.end_datetime)
    editButton.click(openEditBookingModal)
    editCol = $('<td></td>').html(editButton).addClass('text-right')

    row.append(title, start, end, price, spots, registeredMembersCol, editCol)
    $('#events-admin-table').append(row)
}

function openEditBookingModal(event) {
    var startDate = new Date($(event.currentTarget).attr('event-start'))
    var endDate = new Date($(event.currentTarget).attr('event-end'))

    startDay = convertToDay(startDate)
    startTime = convertToTime(startDate)
    endDay = convertToDay(endDate)
    endTime = convertToTime(endDate)

    $('#edit-event-modal').modal('show')
    $('#edit-event-title-input').val($(event.currentTarget).attr('event-title'))
    $('#edit-event-description-input').val($(event.currentTarget).attr('event-description'))
    $('#edit-event-price-input').val($(event.currentTarget).attr('event-price'))
    $('#edit-event-spots-input').val($(event.currentTarget).attr('event-spots'))
    $('#edit-event-start-date-input').val(startDay)
    $('#edit-event-start-time-input').val(startTime)
    $('#edit-event-end-date-input').val(endDay)
    $('#edit-event-end-time-input').val(endTime)
    $('#delete-event-button').attr('event-id', $(event.currentTarget).attr('event-id'))
    $('#edit-event-button').attr('event-id', $(event.currentTarget).attr('event-id'))
}

function convertToDay(date) {
    return date.getFullYear() + '-' + addZero(date.getMonth() + 1) + '-' + addZero(date.getDate())
}

function convertToTime(date) {
    return addZero(date.getHours() - 2) + ':' + addZero(date.getMinutes())
}

function addZero(number) {
    if (number < 10) {
        return '0' + number
    } else {
        return number
    }
}

function showDeleteEventModal(event) {
    $('#edit-event-modal').modal('toggle')
    $('#confirm-delete-event-modal').modal('toggle')

    $('#confirm-deletion-event').click(function () {
        deleteEvent(event)
    })
    $('#confirm-delete-event-modal').on('hidden.bs.modal', function () {
        $('#confirm-deletion-event').unbind()
    })
}

function deleteEvent(event) {
    $.ajax({
        type: "DELETE",
        url: host + "events/" + $(event.currentTarget).attr('event-id'),
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function () {
            $('#events-admin-table').empty()
            $.when(getAllEvents()).done(showAdminEvents)
            $('#edit-event-modal').modal('hide')
        }
    })
}

function editEvent(event) {
    const eventID = $(event.currentTarget).attr('event-id')
    $.ajax({
        type: "PUT",
        url: host + "events/" + eventID,
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        data: JSON.stringify({
            "title": $('#edit-event-title-input').val(),
            "description": $('#edit-event-description-input').val(),
            "price": $('#edit-event-price-input').val(),
            "available_spots": $('#edit-event-spots-input').val(),
            "start_datetime": $('#edit-event-start-date-input').val() + ' ' + $('#edit-event-start-time-input').val() + ':00',
            "end_datetime": $('#edit-event-end-date-input').val() + ' ' + $('#edit-event-end-time-input').val() + ':00',

        }),
        success: function () {
            $('#events-admin-table').empty()
            $.when(getAllEvents()).done(showAdminEvents)
        }
    })
}

function openMembersTableModal(event) {
    $('#registered-modal').modal('toggle')
    $('#registered-modal').attr('event-id', $(event.currentTarget).attr('event-id'))
    getBookedMembers($(event.currentTarget).attr('event-id'), showBookedMembers)
}

function getBookedMembers(eventID, callback) {
    $.ajax({
        type: 'GET',
        url: host + '/events/' + eventID + '/users',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: callback,
        error: failedToEditUser
    })
}

function showBookedMembers(members) {
    $("#bodyrow").empty()
    for (memb of members) {
        displayBookedUser(memb)
    }
    sortTable(0, 'members-table-modal')
    toggleResize()
    //sortTable(0, 'view-member-bookings-table')
}

function displayBookedUser(user) {
    // Instantiate table data cells

    var name = $("<td></td>").text(user.first_name + " " + user.last_name)
    var pNumber = $("<td></td>").text(user.pnr).addClass('can-disappear')
    var email = $("<td></td>").text(user.email).addClass('can-disappear')
    var tel = $("<td></td>").text(user.tel).addClass('can-disappear')
    var edit = $("<td></td>").addClass('text-right')

    var unbookButton = $('<button />').addClass('btn btn-outline-danger').text('Avboka')
    unbookButton.click(unbookModal)
    unbookButton.attr('user-info', user.first_name + " " + user.last_name)
    unbookButton.attr('user-id', user.id)
    unbookButton.attr('event-id', $('#registered-modal').attr('event-id'))
    edit.append(unbookButton)
    var tablerow = $("<tr></tr>") // Instantiate row
    tablerow.append(name, pNumber, email, tel, edit)

    $("#bodyrow").append(tablerow)
}

function unbookModal(event) {
    $('#confirm-unbook-user-modal').modal('toggle')
    $('#unbook-user-label').html('Är du säker på att du vill avboka ')
    $('#unbook-user-label').append($(event.currentTarget).attr('user-info'))
    $('#unbook-user-label').append(' från detta event?')
    $('#confirm-unbook-user').attr('user-id', $(event.currentTarget).attr('user-id'))
    $('#confirm-unbook-user').attr('event-id', $(event.currentTarget).attr('event-id'))
}

function unbookTheUser(event) {
    $.ajax({
        type: "DELETE",
        url: host + "users/" + $(event.currentTarget).attr('user-id') + "/events/" + $(event.currentTarget).attr('event-id'),
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function () {
            $('#registered-modal').attr('hasChanged', true)
            getBookedMembers($(event.currentTarget).attr('event-id'), showBookedMembers)
        },
        error: function () {
            alert("kunde inte avboka! :(")
        }

    })
}