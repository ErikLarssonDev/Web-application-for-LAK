// ------- Show membership pages -------



function viewMembershipLibrary() {
    sessionStorage.setItem('current_view', 'viewMembershipLibrary()')
    updateCrumbs('memberships')

    $("#container").load("/content/admin_pages/edit_memberships/edit_memberships_library.html", function () {
    //TODO: Add event listeners for input validation for edit-modal.
        printMembership()
    })
   // updateCrumbs('membershipLibrary') Please look at this and fix it.
}

function viewMembershipEdit(membershipID) {
    $('#save-membership-edit-button').attr('onclick', "updateMembershipPost(" + membershipID + ")")
    if (isNaN(membershipID)) {
        $('#edit-membership-modal-label').text("Nytt medlemskap")
        $('#name-input-edit-membership').val('') 
        $('#price-input-edit-membership').val('')
        $('#duration-input-edit-membership').val('')
        $('#description-input-edit-membership').val('')
    } else {
        fillMembership(membershipID)
    }
    $('#edit-memberships-modal').modal('toggle')
    $('#users-by-membership-modal').on('hide.bs.modal', function(event){
        if ($(event.target).attr('hasChanged') == 'true'){
            $(event.target).attr('hasChanged', false)
            $.when(getAllEvents()).done(showMembershipUsers)
        }
    })
}

// ------- Show membership -------
function printMembership() {
    $.ajax({
        type: 'GET',
        url: host + '/memberships',
        contentType: "application/json",
        success: function (membershipLibrary) {
            $('#bodyrow').empty()
            for (membership of membershipLibrary) {
                displayMembership(membership);
            }
        }
    });
}

function displayMembership(membership) {
    var header = $('<td></td>').text(membership.title)
    var price = $('<td></td>').text(membership.price)
    var duration = $('<td></td>').text(membership.duration + " månader")
    var user = $('<td></td>')
    var edit = $('<td></td>')
    var del = $('<td></td>')

    var membershipButton = $('<button />').attr('type', 'button').addClass('btn btn-outline-secondary show-users-button').text('Lista')
    membershipButton.addClass('btn btn-outline-secondary show-users-button')
    membershipButton.attr('membership-ID', membership.id)
    membershipButton.click(openMembershipTableModal)

    editButton = $('<button />').addClass('btn btn-outline-secondary edit-button').text('Redigera')
    editButton.attr('data-whatever', membership.id)
    editButton.attr('membership-ID', membership.id)
    
    editButton.attr('onclick', 'viewMembershipEdit(' + membership.id + ')')

    deleteButton = $('<button />').addClass('btn btn-outline-danger delete-button').text('Radera')
    deleteButton.attr('onclick', "showDeleteMembershipModal(" + membership.id + ")")

    user.append(membershipButton)
    edit.append(editButton)
    del.append(deleteButton)

    var tablerow = $("<tr></tr>")
    tablerow.append(header, price, duration, user, edit, del)
    $("#bodyrow").append(tablerow)
}

function fillMembership(membershipID) { //doesnt work, just go into new post mode and add new post not update current one
    $.ajax({
        type: 'GET',
        url: host + 'memberships/' + membershipID,
        contentType: 'application/json',
        success: function (membership) { //get the right membershippost
            loadMembershipInformation(membership)
        }
    })
}

function loadMembershipInformation(membership) {
    $('#edit-membership-modal-label').text("Redigera " + membership.title)
    $('#name-input-edit-membership').val(membership.title) 
    $('#price-input-edit-membership').val(membership.price)
    $('#duration-input-edit-membership').val(membership.duration)
    $('#description-input-edit-membership').val(membership.description)
}

// ------- Publish a new membershippost -------
function updateMembershipPost(membershipID) {
        var title = $('.modal-body #name-input-edit-membership').val()
        var price = parseInt($('#price-input-edit-membership').val())
        var duration = parseInt($('#duration-input-edit-membership').val())
        var description = $('#description-input-edit-membership').val()
        // Fix AJAX to post image to firebase   
        //var image = $('image-area').val() 
        //Add input validation.
        
        if (isNaN(membershipID)) {
            addMembership(title, price, duration, description)
        } else {
            editMembership(membershipID, title, price, duration, description)
        }
}

// ------- Edit, deleate, add membership post -------
function editMembership(membershipID, title, price, duration, description) {
    $.ajax({
        type: 'PUT',
        url: host + 'memberships/' + membershipID,
        contentType: "application/json",
        dataType: 'json',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: JSON.stringify({
            "title": title,
            "price": price,
            "duration": duration,
            "description": description
        }),
        success: function () {
            printMembership()
        }
    });
}
function addMembership(title, price, duration, description) {
    $.ajax({
        type: 'POST',
        url: host + 'memberships',
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        data: JSON.stringify({
            "title": title,
            "price": price,
            "duration": duration,
            "description": description
        }),
        success: function () {
            printMembership()
        }
    });
}
function deleteMembership(membershipID) {
    $.ajax({
        type: 'DELETE',
        url: host + 'memberships/' + membershipID,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: function() {
            printMembership()
        }
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

function showDeleteMembershipModal(id){
    $('#confirm-delete-membership-modal').modal('toggle')
    $('#confirm-delete-membership-button').attr('membership-id', id)

    $('#confirm-delete-membership-button').click(function(event){
       // event.preventDefault()
        deleteMembership($(event.currentTarget).attr('membership-id'))
        $('#confirm-delete-membership-button').unbind()
    })
}

function getMembershipUsers(membershipID, callback) {
    $.ajax({
        type: 'GET',
        url: host + 'memberships/' + membershipID + '/users',
        
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: callback
    })
}


function showMembershipUsers(members) {
    $("#membership-bodyrow").empty()
    for (memb of members) {
        displayMembershipUser(memb)
    }
    sortMembershipTable(0)
    toggleResize()
    sortMembershipTable(0)
}
function openMembershipTableModal(event) {
    $('#users-by-membership-modal').modal('toggle')
    $('#users-by-membership-modal').attr('membership-id', $(event.currentTarget).attr('membership-id'))
    getMembershipUsers($(event.currentTarget).attr('membership-id'), showMembershipUsers)
}

function displayMembershipUser(user) {
    // Instantiate table data cells

    var name = $("<td></td>").text(user.first_name + " " + user.last_name)
    var pNumber = $("<td></td>").text(user.pnr).addClass('can-disappear')
    var email = $("<td></td>").text(user.email).addClass('can-disappear')
    var tel = $("<td></td>").text(user.tel).addClass('can-disappear')
    var tablerow = $("<tr></tr>") // Instantiate row
    tablerow.append(name, pNumber, email, tel)

    $("#membership-bodyrow").append(tablerow)
}