//view FAQ page
function viewFaq() {
    sessionStorage.setItem('current_view', 'viewFaq()')
    $("#container").load("/content/faq/faq.html", function(){
        $.when(getFAQ()).done(showFAQs)
    })
    updateCrumbs('faq')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#navbarSupportedContent').find('span').removeClass('active-nav-link')
    $('#faq-link').children().addClass('active-nav-link')
}

function getFAQ() {
    return $.ajax({
        type: "GET",
        url: host + "FAQs",
        contentType: "application/json",
        error: function () {
            // alert("kunde inte hämta företagsuppgifterna :(")
        }
    })
}

function showFAQs(FAQs){
    for (const FAQ of FAQs){
        var card = $('<div></div>').addClass('card')
        
        var cardHeader = $('<div></div>').addClass('card-header').addClass('faq-header')
        cardHeader.attr('data-toggle', 'collapse').attr('data-target', '#collapse'+ FAQ.id)
        cardHeader.attr('aria-expanded', 'true').attr('aria-controls', 'collapse' + FAQ.id)
        cardHeader.attr('id', 'header' + FAQ.id)

        var header = $('<h3></h3>').addClass('m-3')
        header.html(FAQ.question)

        cardHeader.append(header)

        var answer = $('<div></div>').addClass('collapse')
        answer.attr('id', 'collapse' + FAQ.id)
        answer.attr('area-labelledby', 'header' + FAQ.id)
        answer.attr('data-parent', '#accordion')

        var cardBody = $('<div></div>').addClass('card-body')
        cardBody.html(FAQ.answer)
        answer.append(cardBody)
        card.append(cardHeader, answer)
        $('#accordion').append(card)

    }
}


// --------- COLLAPSABLE -------------
function collapsable() {
    $('.collaps').collapse({
        toggle: false
    })
}