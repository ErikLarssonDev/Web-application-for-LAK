function viewMembers() {
    sessionStorage.setItem('current_view', 'viewMembers()')
    $('#navbarSupportedContent').find('li').each(function () {
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')

    $("#container").load("/content/admin_pages/members/members.html", function () {
        toggleResize()
        $.ajax({
            type: 'GET',
            url: host + 'users',
            headers: {
                "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
            },
            success: function (result) {
                showMembers(result)
            }
        })
    })
    updateCrumbs('members')
}

function sortTable(n, tablename) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    // table = document.getElementById("members-table");
    table = document.getElementById(tablename);
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }

            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }

}

function showMembers(members) {
    $("#bodyrow").empty()
    for (memb of members) {
        displayUser(memb)
    }
    sortTable(0, "members-table")
    toggleResize()
    // sortTable(0)

    showEditUserModal()


    $('#save-edit-button').on('click', function (event) {
        var id = $('#edit-user-modal').data('user-id')
        saveMemberChanges(id)
    })

}

function showEditUserModal() {

    $('#edit-user-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget)
        var userID = parseInt(button.data('id'), 10)
        var modal = $(this)
        modal.data("user-id", userID)

        $.ajax({
            type: 'GET',
            url: host + 'users/' + userID,
            headers: {
                "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
            },
            success: function (user) {
                editUserModal(user, modal)
            },
            error: failedToEditUser
        })

    })
}

function saveMemberChanges(id) {
    updateMemberAdmin(id)
    $('#edit-user-modal').unbind()
    $('#edit-user-modal').modal('hide')
}

function updateMemberAdmin(id) {
    pnr = $('#pn-date-input-edit-user').val() + '-' + $('#pn-numbers-input-edit-user').val()


    var editedMember = {
        "id": id,
        "pnr": pnr,
        "first_name": nullWhenEmpty($('#first-name-input-edit-user').val()),
        "last_name": nullWhenEmpty($('#last-name-input-edit-user').val()),
        "email": nullWhenEmpty($('#email-edit-user').val()),
        "tel": nullWhenEmpty($('#tel-input1').val()),
        "address": nullWhenEmpty($('#address-input1').val()),
        "zip_code": nullWhenEmpty($('#postal-input1').val()),
        "district": nullWhenEmpty($('#city-input1').val()),
        "newsletter": $('#newsletter-check-input').is(':checked')
    }

    $('#save-edit-button').unbind()

    $.ajax({
        type: "PUT",
        url: host + "users/" + id,
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        contentType: 'application/json',
        data: JSON.stringify(editedMember),
        success: viewMembers(),
        error: function () {
            alert("Gick inte att uppdatera")
        }
    })
}

function failedToEditUser() {
    alert("Failed to edit user")
}

function editUserModal(user, modal) {

    modal.find('.modal-title').text('Redigera användare ' + user.first_name + ' ' + user.last_name)
    modal.find('.modal-body #email-edit-user').val(user.email)
    modal.find('.modal-body #pn-date-input-edit-user').val(user.pnr.slice(0, 8))
    modal.find('.modal-body #pn-numbers-input-edit-user').val(user.pnr.slice(9, 13))
    modal.find('.modal-body #first-name-input-edit-user').val(user.first_name)
    modal.find('.modal-body #last-name-input-edit-user').val(user.last_name)
    modal.find('.modal-body #tel-input1').val(user.tel)
    modal.find('.modal-body #address-input1').val(user.address)
    modal.find('.modal-body #postal-input1').val(user.zip_code)
    modal.find('.modal-body #city-input1').val(user.district)
    modal.find('.modal-body #newsletter-check-input').prop('checked', user.newsletter)

    $.ajax({
        type: "GET",
        url: host + "users/" + user.id + "/memberships",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function (result) {
            var name
            $('#memberships-list').empty()
            if (result.length != 0) {
                for (memb of result) {
                    console.log(memb.title)
                    name = $("<li class='list-group-item'>" + memb.title + "</li>")
                    modal.find('.modal-body #memberships-list').append(name)
                }
            } else {
                modal.find('.modal-body #memberships-list').append("<li class='list-group-item'>" + "Inga aktiva medlemskap" + "</li>")
            }
        }
    })
    addTagList(modal, user)

}

function addTagList(modal, user) {
    $('#tag-list').empty()


    if (user.tag != null) {
        var titleID = $("<h6>Tagg (" + user.tag.id + ") aktiv till:</h6>")
        var titleExpire = $("<h6>Giltig till:</h6>")
        var tagExpireDate = new Date(user.tag.active_until)
        var formattedDate = showTime(tagExpireDate)
        var tagNr = $("<p></p>").text(user.tag.id)
        var dateExpire = $("<p></p>").text(formattedDate)

        // Button for removing tag from user
        var removeTagButton = $('<button />').addClass('btn btn-outline-secondary mb-3 ml-2').text('Ta bort tagg')
        removeTagButton.attr("id", "remove-tag-button")
        removeTagButton.attr('data-toggle', "modal")
        removeTagButton.attr("data-target", "#edit-user-modal") //I think this is why the modal toggles off when a tag is removed
        removeTagButton.click(function () {
            removeTagFromUser(user)
        })

        removeTagButton.attr("data-id", user.id)


        $('#tag-list').append(titleID, dateExpire, removeTagButton)


    } else {
        var addTagButton = $('<button />').addClass('btn btn-outline-secondary mb-3 ml-2').text('Lägg till tagg')
        addTagButton.attr("id", "add-tag-button")

        addTagButton.attr("data-target", "#add-tag-modal")
        addTagButton.attr("data-id", user.id)
        addTagButton.click(function () {
            addTagModal()
        })
        modal.find('.modal-body #tag-list').append(addTagButton)

        $('#add-tag-modal').unbind()

        $('#add-tag-modal').on('show.bs.modal', function (event) {
            $('#add-tag-button').unbind()
            var button = $(event.relatedTarget)
            var userID = parseInt(user.id, 10)
            var modal = $(this)
            modal.data("user-id", user.id)

            $("#save-user-tag-button").attr("data-id", user.id)
            $('#save-user-tag-button').click(function () {
                saveUserTag(user.id)
            })
            $("#close-user-tag-modal-button").attr("data-id", user.id)
            $("#close-add-tag").attr("data-id", user.id)

        })


    }

}


function removeTagFromUser(user) {//userID, tagID){
    $.ajax({
        type: "DELETE",
        url: host + "users/" + user.id + "/tags",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        contentType: 'application/json',
        data: JSON.stringify({
            "id": user.tag.id
        }),
    })
}

function addTagModal() {
    $('#edit-user-modal').modal('hide')
    $('#add-tag-modal').modal('show')

    $('#add-tag-modal').on('hide.bs.modal', function (e) {
        $('#tag-number-input').trigger('reset')
        $('#tag-expire-date-input').empty()
        $('#add-tag-modal').unbind(e)
    })
}

function saveUserTag(id) {
    //Update tag changes
    //Tag number
    var tagNr = parseInt($("#tag-number-input").val(), 10)
    //Expiry date
    var expiryDate = $("#tag-expire-date-input").val()

    addTag(tagNr, expiryDate, id)
}

function addTag(tagNr, expiryDate, id) {
    $.ajax({
        type: 'POST',
        url: host + 'tags',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        contentType: 'application/json',
        data: JSON.stringify({
            "id": tagNr,
            "active_until": expiryDate
        }),
        success: function () {
            addTagWhenExists(id, tagNr, expiryDate)
        },
        error: function (request, status, error) {
            if (request.status == 400) {
                addTagWhenExists(id, tagNr, expiryDate)
            }
        }
    })
}

function addTagWhenExists(id, tagNr, expiryDate) {

    $.ajax({
        type: 'POST',
        url: host + 'users/' + id + '/tags/' + tagNr,
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: function () {
            $('#add-user-tag-form').trigger("reset")
            $('#add-tag-modal').unbind()
            $('#add-tag-modal').modal('toggle')
            $("#save-user-tag-button").unbind()
        },
        error: function () {
            $("#save-user-tag-button").unbind()
            $("#save-user-tag-button").attr("data-id", id)
            $('#save-user-tag-button').click(function () {
                saveUserTag(id)
            })
            alert("Kunde inte lägga till tagg. Taggnummer upptaget. Försök igen")
            addTagModal()

        }
    })
}

function findSearchResult(searchInput, tablename) {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(searchInput);
    filter = input.value.toUpperCase();
    table = document.getElementById(tablename);
    tr = table.getElementsByTagName("tr");

    for (i = 1; i < tr.length; i++) {
        td = tr[i];
        //     td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }

}

function displayUser(user, is_admin) {
    // Instantiate table data cells
    var name = $("<td></td>").text(user.first_name + " " + user.last_name)
    var pNumber = $("<td></td>").text(user.pnr).addClass('can-disappear')
    var email = $("<td></td>").text(user.email).addClass('can-disappear')
    var tel = $("<td></td>").text(user.tel).addClass('can-disappear')
    var address = $("<td></td>").text(user.address).addClass('can-disappear')
    var edit = $("<td></td>")

    var editButton = $('<button />').addClass('btn btn-outline-secondary').text('Redigera')
    editButton.attr('data-toggle', "modal")
    editButton.attr('data-target', "#edit-user-modal")
    editButton.attr('data-whatever', user.first_name + " " + user.last_name)
    editButton.attr('data-id', user.id)
    editButton.attr('id', user.id + "-user-button")
    edit.append(editButton)
    var tablerow = $("<tr></tr>") // Instantiate row
    tablerow.append(name, pNumber, email, tel, address, edit)

    $("#bodyrow").append(tablerow)
}
// TODO this does not seem to work
function exportMembers() {
    $.ajax({
        type: "GET",
        url: host + "users/exportdata",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function () {
            window.location.href = "/Medlemmar.csv"
        }
    })

}

function nullWhenEmpty(inputString) {
    if (inputString == "") {
        return null;
    } else {
        return inputString
    }
}

function sortMembershipTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("user-membership-table");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    if (n == 0) {
                        $('#name').text("Name [A-Ö]")
                        $('#user-membership-pnr-icon').removeClass("fa fa-arrow-down")
                        $('#user-membership-pnr-icon').removeClass("fa fa-arrow-up")
                    } else if (n == 1) {
                        $('#name').text("Name")
                        $('#user-membership-pnr-icon').removeClass("fa fa-arrow-down")
                        $('#user-membership-pnr-icon').addClass('fa fa-arrow-up')
                    }
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    if (n == 0) {
                        $('#name').text("Name [Ö-A]")
                        $('#user-membership-pnr-icon').removeClass("fa fa-arrow-down")
                        $('#user-membership-pnr-icon').removeClass("fa fa-arrow-up")
                    } else if (n == 1) {
                        $('#name').text("Name")
                        $('#user-membership-pnr-icon').removeClass("fa fa-arrow-up")
                        $('#user-membership-pnr-icon').addClass('fa fa-arrow-down')
                    }
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}
