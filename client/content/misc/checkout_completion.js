function viewCheckoutCompletion() {
    sessionStorage.setItem('current_view', 'viewCheckoutCompletion()') 

    $("#container").load("/content/misc/checkout_completion.html", function () {
        let params = new URLSearchParams(document.location.search)
        let productId = params.get("productId")
        let type = params.get("type")
        showCheckoutInfo(productId, type)
        history.pushState(null, '', '/?');
        sessionStorage.setItem('current_view', 'viewHome()')
        $('#your-profile-link').on("click", function (e) {
            e.preventDefault()
            viewProfile()
        })
    })
}

function showCheckoutInfo(id, type) {
    $.ajax({
        type: "GET",
        url: host + type + "s/" + id,
        contentType: 'application/json',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth'))},
        success: function(res) {
            $('#purchased-product').html("Du har köpt: <strong>" + res.title + "</strong>")
            $('#purchased-product-price').html("För priset: <strong>" + res.price + " kr</strong>")
        }
    })
}