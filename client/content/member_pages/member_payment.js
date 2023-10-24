
function viewProfilePayment() {
    sessionStorage.setItem('current_view', 'viewProfilePayment()')

    loadProfileView('member_payment.html', function () {
        $('#profile-page-content-header').html('Betalningar')
        showMemberPayment()
        //sidebar content -- can färga knappar men inte avfärga dem 
        $('#sidebar-content').find('button').each(function () {
            $(this).removeClass('active-button')
        })
        $('#sidebar-content').find('button').removeClass('active-button')
        $('#payment-button').addClass('active-button')
    })

    updateCrumbs('payment')
}

function showMemberPayment() {
    $.ajax({
        type: "GET",
        url: host + "users/" + sessionStorage.getItem('uid') + "/payments", 
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')) },
        success: function (payments) {
            $("#bodyrow").empty()
            if (payments.length != 0) {
                for (pay of payments.reverse()) {
                    displayPayment(pay)
                }
            } else {
                var tablerow = $("<tr></tr>")
                var name = $("<td></td>").text('-')
        
                var time = $("<td></td>").text('-')
                var amount = $("<td></td>").text('-')
                tablerow.append(name, time, amount)
                $("#bodyrow").append(tablerow)
            }
        }
    })
}

function displayPayment(payment) {
    var name = $("<td></td>").text(payment.product_type)
    var purchaseDate = new Date(payment.payment_time)
    var formattedPurchase = showTime(purchaseDate)
    var time = $("<td></td>").text(formattedPurchase)
    var amountKr = payment.amount / 100
    var amount = $("<td></td>").text(amountKr)
    var tablerow = $("<tr></tr>") 
    
    tablerow.append(name, time, amount)
    $("#bodyrow").append(tablerow)
}

