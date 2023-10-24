let memberEvents = null;

function viewProfileBooking() {
    sessionStorage.setItem('current_view', 'viewProfileBooking()')
    $('#navbarSupportedContent').find('li').each(function () {
        $(this).children().removeClass('active-nav-link')
    })
    $('#profile-item').children().addClass('active-nav-link')
    $('#profile-logo').addClass('active-nav-link')
    $('#admin-logo').removeClass('active-nav-link')
    
    updateCrumbs('profileBookings')
    loadProfileView('member_booking.html', function () {
        $('#profile-page-content-header').html('Bokningar')
        // $.when(getUser()).done(showProfile)
        $.when(getEvents()).done(events => {
            memberEvents = events
            showMemberBookings(memberEvents)
        })
        //sidebar content -- can färga knappar men inte avfärga dem 
        $('#sidebar-content').find('button').each(function () {
            $(this).removeClass('active-button')
        })
        $('#sidebar-content').find('button').removeClass('active-button')
        $('#booking-button').addClass('active-button')
    })
}


function getEvents() {
    return $.ajax({
        type: "GET",
        // url: host + "users/" + sessionStorage.getItem('uid') + "/memberships", 
        url: host + "users/" + sessionStorage.getItem('uid') + "/events", //This is just temporary until merge is complete
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) }
    })
}

function showMemberBookings(bookings) {
    $("#bodyrow-current-booking").empty()
    if (bookings.length == 0) {
        var name = $("<td></td>").text("-")
        var starttime = $("<td></td>").text("-").addClass('can-disappear')
        var endtime = $("<td></td>").text("-").addClass('can-disappear')
        var amount = $("<td></td>").text("-").addClass('can-disappear')
        var tablerow = $("<tr></tr>")
        tablerow.append(name, starttime, endtime, amount)
        $("#bodyrow-current-booking").append(tablerow)
    } else {
        for (event of bookings) {
            displayEvent(event)
        }
    }
    toggleResize()

}

function displayEvent(event) {
    var name = $("<td></td>").text(event.title)

    var start = new Date(event.start_datetime)
    var end = new Date(event.end_datetime)
    var starttime = $("<td></td>").text(showTime(start))//.addClass('can-disappear')
    var endtime = $("<td></td>").text(showTime(end)).addClass('can-disappear')

    var amount = $("<td></td>").text(event.price).addClass('can-disappear')
    var tablerow = $("<tr></tr>")
    tablerow.append(name, starttime, endtime, amount)

    currentDate = new Date()

    if (start.getTime() < currentDate.getTime()) {
        $("#bodyrow-previous-booking").append(tablerow)
    } else {
        var button = $('<button></button>')
        button.attr('type', 'button')
        button.addClass('btn btn-danger m-1')
        button.html('Avboka')
        button.attr('event-id', event.id)
        button.attr('data-toggle', 'modal')
        button.attr('data-target', '#cancel-booking-modal-member')
        button.attr('onClick', 'unbookEvent(' + event.id + ')') //This modal never shows up

        tablerow.append(button)


        $("#bodyrow-current-booking").append(tablerow)
    }
}

function unbookEvent(eventID) {
    $('#cancel-booking-modal-member').modal('toggle')

    $('#confirm-cancel').click(function () {

        for (i in memberEvents) {
            if (memberEvents[i].id == eventID) {
                memberEvents.splice(i, 1)
            }
        }

        $.ajax({
            type: "DELETE",
            url: host + 'users/' + sessionStorage.getItem('uid') + '/events/' + eventID,
            contentType: "application/json",
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
            success: viewProfileBookingAgain,
            // function(){
            //     $('#confirm-cancel').unbind()
            //     $('#cancel-booking-modal').on('hidden.bs.modal', viewProfileBooking)
            // },
            error: function () {
                $('#confirm-cancel').unbind()
                alert("kunde inte avboka! :(")
            }

        })
    })
}

function viewProfileBookingAgain() {
    //viewProfileBooking()
    showMemberBookings(memberEvents)
    $('#confirm-cancel').unbind()
    $('#cancel-booking-modal-modal-member').modal('hide')
}


function showTime(date) {
    const formattedDate = date.toLocaleString("sv-SW", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    return formattedDate
}