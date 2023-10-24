//views about page
function viewAbout() {
    sessionStorage.setItem('current_view', 'viewAbout()')

    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#navbarSupportedContent').find('span').removeClass('active-nav-link')
    $('#about-link').children().addClass('active-nav-link')

    $("#container").load("/content/about/about.html", function () {
        $('#protocols-link').click(viewProtocols)
        $.ajax({
            type: "GET",
            url: host + "board_members",
            contentType: "application/json",
            success: showBoardMembers,
            error: function(){
                alert("kunde ej hämta styrelsemedlemmar")
            }
        })
    })
    updateCrumbs('about')
}

function showBoardMembers(boardMembers){
    for (const boardMember of boardMembers){
        
        var card = $('<div></div>').addClass('card mr-2 mb-2').width('280px')
        var img = $('<img></img>').addClass('card-img-top')
        var body = $('<div></div>').addClass('card-body')
        img.attr('src', boardMember.img).attr('alt', boardMember.name)
        var title = $('<h5></h5>').addClass('card-title').html(boardMember.title)
        var name = $('<h6></h6>').html(boardMember.name)
        var email = $('<p></p>').html(boardMember.email)
        body.append(title).append(name).append(email)
        card.append(img).append(body)
        $('#board-members').append(card)
    }
}