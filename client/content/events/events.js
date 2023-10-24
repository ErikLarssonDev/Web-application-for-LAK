function viewEvents(){
    sessionStorage.setItem('current_view', 'viewEvents()')

    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#navbarSupportedContent').find('span').removeClass('active-nav-link')
    $('#events-link').children().addClass('active-nav-link')

    updateCrumbs('events')
    $("#container").load("/content/events/events.html", function () {
        if (sessionStorage.getItem('auth') != null){
            // fetch both users booked events and all events
            $.when(getUserEvents(), getAllEvents()).done(filterAllEvents)
        } else {
            // only fetch all events
            $.when(getAllEvents()).done(showAllEvents)
        }

        $('#confirm-booking-modal').on('hide.bs.modal', function () {
            $('#confirm-booking').off("click")
        })

        $('#cancel-booking-modal').on('hide.bs.modal', function () {
            $('#confirm-cancel').off("click")
        })
    })
}

function getUserEvents(){
    return $.ajax({
        type: "GET",
        url: host + "users/" + sessionStorage.getItem('uid') + "/events",
        contentType: "application/json",
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))},
        error: function () {
            alert("kunde inte hämta användarens bokade events :(")
        }
    })
}

function getAllEvents() {
    return $.ajax({
        type: "GET",
        url: host + "events",
        contentType: "application/json",
        error: function () {
            alert("kunde inte hämta events :(")
        }
    })
}

// displays this weeks and next weeks events (on home view). This function is never used.
function showEvents(events){
    const today = new Date()
    const sortedEvents = events.sort(compareEvents)
    for (const event of sortedEvents) {
        const eventDate = new Date(event.start_datetime)
        const timeBetween = eventDate.getTime() - today.getTime()
        const daysBetween = Math.ceil(timeBetween / (1000 * 3600 * 24))
        const theEvent = createFullEvent(event)
        if (daysBetween > 0) { // if event has occured
        if (thisWeek(today, daysBetween)) {
            $('#this-week').append(theEvent)
        } else if (nextWeek(today, daysBetween)) {
            $('#next-week').append(theEvent)
        }
    }
}
}

// displays all events without buttons (when not logged in)
function showAllEvents(allEvents){
    const today = new Date()
    const sortedEvents = allEvents.sort(compareEvents)
    for (const event of sortedEvents) {
        appendEvent(event, today, false)
    }
}

// displays all events with buttons if user is logged in (on events view)
function filterAllEvents(userEvents, allEvents){
    const today = new Date()
    const sortedEvents = allEvents[0].sort(compareEvents)
    for (const event of sortedEvents) {
        // check if user is booked on event
        var eventIsBooked = false
        for (const userEvent of userEvents[0]){
            if (event.id == userEvent.id){
                eventIsBooked = true
                break
            }
        }
        appendEvent(event, today, eventIsBooked)
    }
}

function appendEvent(event, today, userIsBooked) {
    const eventDate = new Date(event.start_datetime)
    const timeBetween = eventDate.getTime() - today.getTime()
    const daysBetween = Math.ceil(timeBetween / (1000 * 3600 * 24))
    const theEvent = createFullEvent(event, userIsBooked)
    if (daysBetween > 0) { //if it has already occured
        if (thisWeek(today, daysBetween)) {
            $('#this-week').append(theEvent)
        } else if (nextWeek(today, daysBetween)) {
            $('#next-week').append(theEvent)
        } else {
            $('#later').append(theEvent)
        }
    }
}

const weekday = ["Sön","Mån","Tis","Ons","Tor","Fre","Lör"];
const months = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];  
//creates event for the home view
function createSmallEvent(event) {
    const time = createDate(event.start_datetime)

    var eventCard = $('<div></div>').addClass('card mr-2 mb-2')
    var cardBody = $('<div></div>').addClass('card-body')
    var eventHeader = $('<h4></h4>').html(event.title)
    var eventDate = $('<h5></h5>').html(time)
    var eventContent = $('<p></p>').html(event.description)
    if (event.available_spots == null) {
        var capacity = $('<p></p>').html('Antal platser kvar: Obegränsat')
    } else {
        var capacity = $('<p></p>').html('Antal platser kvar: ' + event.available_spots)
    }
    cardBody.append(eventHeader).append(eventDate).append(eventContent).append(capacity)
    eventCard.width('300px')
    eventCard.append(cardBody)
    return eventCard
}

//creates event for events view
function createFullEvent(event, eventIsBooked) {
    const time = createDate(event.start_datetime)

    var eventCard = $('<div></div>').addClass('card mr-2 mb-2')
    var cardBody = $('<div></div>').addClass('card-body')

    var eventHeader = $('<h4></h4>').html(event.title)
    var eventDate = $('<h5></h5>').html(time)
    var eventContent = $('<p></p>').html(event.description)
    var price = $('<p></p>').html('Pris: ' + event.price + 'kr')
    if (event.available_spots == null) {
        var capacity = $('<p></p>').html('Antal platser kvar: Obegränsat')
    } else {
        var capacity = $('<p></p>').html('Antal platser kvar: ' + event.available_spots)
    }

    cardBody.append(eventHeader).append(eventDate).append(eventContent).append(price).append(capacity)

    if (sessionStorage.getItem('auth') != null) {

        if (event.available_spots > 0 || event.available_spots == null) {
            if (!eventIsBooked) {
                cardBody.append(createBookButton(event))
            }
        }
        if (eventIsBooked) {
            cardBody.append(createCancelButton(event))
        }
    }
    eventCard.width('272px')
    eventCard.append(cardBody)
    return eventCard
}

function createDate(datetime){
    const date = new Date(datetime)

    date.setHours(date.getHours()-2)
    var hour
    if (date.getHours() == 0) {
        hour = '00'
    } else if (date.getHours() < 10) {
        hour = '0' + date.getHours()
    } else {
        hour = date.getHours()
    }
    var minutes
    if (date.getMinutes() == 0) {
        minutes = '00'
    } else 
    if (date.getMinutes() < 10) {
        minutes = '0' + date.getMinutes()
    } else {
        minutes = date.getMinutes()
    }
    return weekday[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + hour + ':' + minutes

}

// creates a button for booking an event
function createBookButton(event){
    var button = $('<button></button>')
    button.attr('type', 'button')
    button.addClass('btn btn-primary my-2')
    button.html('Boka')
    button.attr('event-id', event.id)
    button.attr('event-price', event.price)
    button.attr('event-title', event.title)
    button.click(bookMember)
    return button
}
// creates a button for cancelling an event
function createCancelButton(event){
    var button = $('<button></button>')
    button.attr('type', 'button')
    button.addClass('btn btn-danger')
    button.html('Avboka')
    button.attr('event-id', event.id)
    button.click(cancelMemberBooking)
    return button
}
// books the current user to an event
function bookMember(){
    eventId = $(this).attr('event-id')
    eventPrice = $(this).attr('event-price')
    eventTitle = $(this).attr('event-title')

    if (eventPrice == 0) {
        $('#confirm-booking-modal').modal('toggle')
        $('#confirm-booking').click(function(){
            $.ajax({
                type: "POST",
                url: host + "users/" + sessionStorage.getItem('uid') + "/events/" + eventId,
                contentType: "application/json",
                headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
                success: function(){
                    if (sessionStorage.getItem('current_view') == 'viewHome()') {
                        viewHome()
                    } else {
                        viewEvents()
                    }
                },
                error: function () {
                    alert("kunde inte boka! :(")
                }
            })
        })
    } else {
        $('#purchase-booking-modal').modal('toggle')
        $('#event-name').html(eventTitle)
        $('#event-price').html("Att betala: <strong>" + eventPrice + " kr</strong>")
        setItem(eventId, "event")
        initialize()
        document.querySelector("#payment-form").addEventListener("submit", handleSubmit);
    }
}
// unbooks the current user from an event
function cancelMemberBooking(){
    $('#cancel-booking-modal').modal('toggle')
    eventID = $(this).attr('event-id')
    $('#confirm-cancel').click(function(){
        $.ajax({
            type: "DELETE",
            url: host + "users/" + sessionStorage.getItem('uid') + "/events/" + eventID,
            contentType: "application/json",
            headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))},
            success: function(){
                if (sessionStorage.getItem('current_view') == 'viewHome()') {
                    viewHome()
                } else {
                    viewEvents()
                }
            },
            error: function(){
                alert("kunde inte avboka! :(")
            }
    
        })
    })
    
}
//checks iv an event is this week
function thisWeek(today, daysBetween){
    const daysUntilNextWeek = [0, 6, 5, 4, 3, 2, 1]

    if (daysBetween > daysUntilNextWeek[today.getDay()]) {
        return false
    } else {
        return true
    }
}
//checks if an event is next week
function nextWeek(today, daysBetween){
    const daysUntilNextWeek = [7, 13, 12, 11, 10, 9, 8]
    if (daysBetween > daysUntilNextWeek[today.getDay()]) {
        return false
    } else {
        return true
    }
}

//sorts the events according to when the events take place
function compareEvents(a, b){
    aDate = new Date(a.start_datetime)
    bDate = new Date(b.start_datetime)
    if (aDate < bDate) {return -1}
    else if (aDate > bDate) {return 1}
    return 0
}