function viewTags() {
    sessionStorage.setItem('current_view', 'viewTags()')
    $("#container").load("/content/admin_pages/tags/tags.html", function () {
        toggleResize()
        $.when(getTags()).done(tags => {
            showTags(tags)
        })

    })
    updateCrumbs('tags')
}

function getTags() {
    return $.ajax({
        type: 'GET',
        url: host + 'tags',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
    })
}

function showTags(tags) {
    $("#bodyrow").empty()
    if (tags.length != 0) {
        for (tag of tags) {
            displayTag(tag)
        }
    }

    sortTableTags(0, 'tags-table')
    toggleResize()
    sortTableTags(0, 'tags-table')

    //Do we want to edit and remove tags here as well maybe?
}

function displayTag(tag) {
    var tagID = $("<td></td>").text(tag.id)
    var date = new Date(tag.active_until)
    var formattedDate = showTime(date)
    var validUntil = $("<td></td>").text(formattedDate).addClass('can-disappear')
    var name = tag.owned_by
    var tagUser = $("<td></td>").text('-').addClass('can-disappear')
    if (name != null) {
        tagUser = $("<td></td>").text(name).addClass('can-disappear')
    }

    var deleteTag = $("<td></td>")

    var deleteButton = $('<button />').addClass('btn btn-outline-secondary').text('Ta bort')
    deleteButton.attr('onclick', 'deleteTag(' + tag.id + ')')
    deleteButton.attr('data-id', tag.id)
    deleteButton.attr('id', tag.id + "-tag-button")
    deleteTag.append(deleteButton)

    var tablerow = $("<tr></tr>") // Instantiate row
    tablerow.append(tagID, validUntil, tagUser, deleteTag)

    $("#bodyrow-tags").append(tablerow)
}

function deleteTag(id) {
    $.ajax({
        type: 'DELETE',
        url: host + 'tags/' + id,
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
        success: viewTags
    })
}

function sortTableTags(n, tablename) {
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
            var cmpX = isNaN(parseInt(x.innerHTML)) ? x.innerHTML.toLowerCase() : parseInt(x.innerHTML);
            var cmpY = isNaN(parseInt(y.innerHTML)) ? y.innerHTML.toLowerCase() : parseInt(y.innerHTML);
            cmpX = (cmpX == '-') ? 0 : cmpX;
            cmpY = (cmpY == '-') ? 0 : cmpY;
            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (dir == "asc") {
                //if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                if (cmpX > cmpY) {
                    if (n == 0) {
                        $('#name').text("Name [A-Ö]")
                        $('#member-pnr-icon').removeClass("fa fa-arrow-down")
                        $('#member-pnr-icon').removeClass("fa fa-arrow-up")
                    } else if (n == 1) {
                        $('#name').text("Name")
                        $('#member-pnr-icon').removeClass("fa fa-arrow-down")
                        $('#member-pnr-icon').addClass('fa fa-arrow-up')
                    }
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                //if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                if (cmpX < cmpY) {
                    // If so, mark as a switch and break the loop:
                    if (n == 0) {
                        $('#name').text("Name [Ö-A]")
                        $('#member-pnr-icon').removeClass("fa fa-arrow-down")
                        $('#member-pnr-icon').removeClass("fa fa-arrow-up")
                    } else if (n == 1) {
                        $('#name').text("Name")
                        $('#member-pnr-icon').removeClass("fa fa-arrow-up")
                        $('#member-pnr-icon').addClass('fa fa-arrow-down')


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