function viewProfileMembership() {
    sessionStorage.setItem('current_view', 'viewProfileMembership()') 
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#profile-item').children().addClass('active-nav-link')
    $('#profile-logo').addClass('active-nav-link')
    $('#admin-logo').removeClass('active-nav-link')
    updateCrumbs('profileMemberships')

    loadProfileView('member_membership.html', function(){
        loadMemberships()
        $('#profile-page-content-header').html('Medlemskap')
        //sidebar content -- can färga knappar men inte avfärga dem 
        $('#sidebar-content').find('button').each(function () {
            $(this).removeClass('active-button')
        })
        $('#sidebar-content').find('button').removeClass('active-button')
        $('#membership-button').addClass('active-button')
    })
    getCurrentPage()
}

function loadMemberships() {
    var allMemberships;
    var userMemberships;
    var elementFound = false;

    $.ajax({
        type: "GET",
        url: host + "memberships",
        contentType: 'application/json',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))},
        success: function(response) {
            allMemberships = response;

            $.ajax({
                type: "GET",
                url: host + "users/" + sessionStorage.getItem('uid') + "/memberships",
                contentType: 'application/json',
                headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))},
                success: function(response) {
                    userMemberships = response;
                    for (i in allMemberships) {
                        elementFound = false;
                        for (j in userMemberships) {
                            if (allMemberships[i]["id"] == userMemberships[j]["id"]) {
                                endDate = new Date(userMemberships[j]["end_date"]).getTime()
                                if (endDate > Date.now()) {
                                    elem = createMembershipElement(userMemberships[j], true);
                                    $("#active-memberships").after(elem);
                                    elementFound = true;
                                }
                            }
                        }
                        if (!elementFound) {
                            elem = createMembershipElement(allMemberships[i], false);
                            $("#inactive-memberships").after(elem);
                        }
                    }

                    $(".fade-in").hide();
                    $(".fade-in").fadeIn("slow");
                },
                error: function() {
                    alert("Något gick fel");
                }
            })
        },
        error: function() {
            alert("Något gick fel");
        }
    })
}

function loadCheckout(memName, priceInfo, memId) {
    $("#profile-page-content").load("/content/misc/checkout.html", function () {
        $('#profile-page-content-header').html('Betala')
        a = $("<h2></h2>").text(memName);
        b = $("<h2></h2>").text(priceInfo);
        $("#purchase-info").append(a, b);
        $.ajax({
            type: "GET",
            url: host + "memberships/" + memId,
            contentType: 'application/json',
            headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))},
            success: function(membership) {
                setItem(membership.id, "membership")
                initialize();
                checkStatus();
            }
        })
    })
}

function createMembershipElement(memId, active) {
    var strong = $("<strong></strong>").text(memId["title"]); // Only used for membership name

    var container   = $("<div></div>").addClass("container shadow-sm rounded p-2 my-2");
    var row         = $("<div></div>").addClass("row");
    var firstCol    = $("<div></div>").addClass("col-2 d-flex align-items-center");
    var secondCol   = $("<div></div>").addClass("col");
    var thirdCol    = $("<div></div>").addClass("col d-flex justify-content-end align-items-center");

    var icon = $("<i></i>").attr({style: "font-size: 45px; color: var(--primary-color);", "aria-hidden": "true"}); // Icon
    var nameElem = $("<div></div>").append(strong).addClass("m-0"); // Membership name
    var buyButton = $("<button></button>").addClass("btn btn-primary rounded-pill border-0 mr-2");
    buyButton.attr({type: "button", style: "width: 90px;"});

    if (active) { //Added alternative to smilies.
        icon.addClass("fa fa-check m-1"); //fa-smile-o for a checkmark
        //icon.attr({style: "color:green; font-size: 45px;", "aria-hidden": "true"})
        buyButton.attr("disabled", "true");
        buyButton.text("Aktivt");
        var infoElem = $("<div></div>").text("Gäller t.o.m. " + convertDate(memId["end_date"])).addClass("m-0"); // Info text (expiry or price)
    } else {
        icon.addClass("fa fa-close m-1"); //fa-frown-o for a cross
        //icon.attr({style: "color:red; font-size: 45px;", "aria-hidden": "true"})
        buyButton.attr("onclick","loadCheckout('" + memId["title"] + "', 'Pris: " + memId["price"] + "', '" + memId["id"] + "')");
        buyButton.text("Köp");
        var infoElem = $("<div></div>").text("Pris: " + memId["price"] + " kr").addClass("m-0"); // Info text (expiry or price)
    }

    firstCol.append(icon);
    secondCol.append(nameElem, infoElem);
    thirdCol.append(buyButton);
    row.append(firstCol, secondCol, thirdCol);
    container.append(row);

    container.addClass("fade-in");

    return container;
}

function convertDate(date) {
    const year = date.substring(11, 16)
    const month = convertMonthToNumber(date.substring(8, 11))
    const day = date.substring(5, 7)

    return year + "-" + month + "-" + day
}

function convertMonthToNumber(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const isMonth = (element) => element == month;
    const theMonth = months.findIndex(isMonth) + 1
    if (theMonth < 10){
        return '0' + theMonth
    } else {
        return theMonth
    }
}