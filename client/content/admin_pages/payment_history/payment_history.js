function viewAllPayments() {
    sessionStorage.setItem('current_view', 'viewAllPayments()')
    $('#navbarSupportedContent').find('li').each(function () {
        $(this).children().removeClass('active-nav-link')
    })
    $('#admin-item').children().addClass('active-nav-link')
    $('#admin-logo').addClass('active-nav-link')
    $('#profile-logo').removeClass('active-nav-link')
    $("#container").load("/content/admin_pages/payment_history/payment_history.html", function () {
        //$('#news-button').click(viewNewsEdit) //kan inte ha något värde här, går då direkt till viewNewsEdit
        //printNews()
        toggleResize()
        $.when(getAllPayments()).done(payments => {
            showPayments(payments)
        })


    })
    updateCrumbs('adminPayments')
}


function getAllPayments() {
    return $.ajax({
        type: 'GET',
        url: host + '/payments',
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
    })
}

function showPayments(payments) {
    $("#bodyrow").empty()
    $.when(printAllPayments(payments)).done(e => {
        sortTable(0, 'payment-admin-table')
        toggleResize()
    })

    //sortTablePayments(1)

}

function printAllPayments(payments) {
    if (payments.length != 0) {
        for (pay of payments.reverse()) {
            displayPaymentAdmin(pay)
        }
    } else {
        var what = $("<td></td>").text('-')
        var when = $("<td></td>").text('-').addClass('can-disappear')
        var cost = $("<td></td>").text('-')
        var who = $("<td></td>").text('-').addClass('can-disappear')

        var tablerow = $("<tr></tr>") // Instantiate row
        tablerow.append(what, when, cost, who)

        $("#bodyrow").append(tablerow)
    }
}


function displayPaymentAdmin(payment) {

    $.when(getUser(payment.payee)).done(user => {
        var what = $("<td></td>").text(payment.product_type)

        var purchaseDate = new Date(payment.payment_time)

        var formattedDate = showTime(purchaseDate)
        var when = $("<td></td>").text(formattedDate)

        var cost = $("<td></td>").text(payment.amount)

        var username = user.first_name + " " + user.last_name
        var who = $("<td></td>").text(username).addClass('can-disappear')

        var tablerow = $("<tr></tr>") // Instantiate row
        tablerow.append(what, when, cost, who)

        $("#bodyrow").append(tablerow)

    })
}

function getUser(id) {
    return $.ajax({
        type: 'GET',
        url: host + 'users/' + id,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))
        },
    })
}
