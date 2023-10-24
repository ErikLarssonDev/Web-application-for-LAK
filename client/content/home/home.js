//----------------------------------------------------------------------------------------
//-- HOME VIEW ----------------------------------------------------------------------
//----------------------------------------------------------------------------------------
function viewHome() {
    sessionStorage.setItem('current_view', 'viewHome()')
    updateCrumbs('home')

    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#navbarSupportedContent').find('span').removeClass('active-nav-link')
    $('#home-link').children().addClass('active-nav-link')

    $("#container").load("/content/home/home.html", function () {
        getPosts(showPosts)
        $.when(getCategories().done(function(categories){
            console.log(categories)
            getFeatureImages(categories, showFeatureImagesHome)
        }))
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

function getPosts(callback){
    $.ajax({
        type: "GET",
        url: host + "posts",
        contentType: "application/json",
        success: callback,
        error: function () {
            alert("kunde inte hämta nyheter :(")
        }
    })
}

function showPosts(posts) {
    var allNews = $('#news-list')
    posts.sort(comparePosts)
    amountOfNews = 0
    for (const post of posts) {
        if (amountOfNews == 5) {break}
        $('#news-container').append(createPost(post))
        amountOfNews++
    }
    if (posts.length > amountOfNews){
        var link = $('<a href="#"></a>').html('Se äldre inlägg')
        link.click(viewOlderPosts)
        $('#news-container').append(link)
    }
}

function createPost(post){
    const year = post.post_time.substring(11, 16)
    const month = convertMonthToNumber(post.post_time.substring(8, 11))
    var day = post.post_time.substring(5, 7)
    var card = $('<div></div>').addClass('card')
    var cardBody = $('<div></div>').addClass('card-body')
    
    card.addClass('post-card')

    var theHeader = $('<h3></h3>').html(post.title)
    cardBody.append(theHeader)
    cardContent = $('<div></div>').addClass('d-flex')

    if (post.img != undefined){
        var img = new Image()
        img.src = post.img
        $(img).addClass('img-fluid')


        if (img.width / img.height < 1.4){
            $(img).addClass('card-text align-self-start mr-2')
            cardContent.addClass('flex-row flex-nowrap image-div-resize')
            cardContent.append($(img))
        } else {
            cardContent.addClass('flex-column flex-wrap')
            $(img).addClass('align-self-center card-text')
            cardContent.addClass('flex-wrap')
            cardContent.append($(img))
        }
        if (cardContent.width < 1000) {
            $(img).css('max-height', '250px')
        } else {
            $(img).css('max-height', '400px')
        }
    }
    toggleResize()

    var newsContent = $('<p></p>').html(post.description).addClass('card-text')
    cardContent.append(newsContent)

    var newsDate = $('<h5></h5>').addClass('news-date ')
    newsDate.html('Publicerad: ' + year + '-' + month + '-' + day)
    cardBody.append(newsDate, cardContent)

    card.append(cardBody)
    return card
}

function comparePosts(a, b){
    aDate = new Date(a.post_time)
    bDate = new Date(b.post_time)

    if (aDate > bDate) { return -1 }
    else if (aDate < bDate) { return 1 }
    return 0
}

function convertMonthToNumber(month){
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const isMonth = (element) => element == month;
    const theMonth = months.findIndex(isMonth)+1
    if (theMonth < 10){
        return '0'+theMonth
    } else {
        return theMonth
    }
}

function showFeatureImagesHome(images){
    console.log(images)
    for (const image of images){
        appendImageToHome(image)
    }
}

function appendImageToHome(image){
    var li = $('<li></li>')
    var img = $('<img></img>').addClass('img-fluid').addClass('rounded').addClass('mr-5')
    img.height('200px')
    img.attr('src', image.src).attr('alt', image.name)
    li.append(img)
    $('#feature-images-list-home').append(li)
    

}
//----------------------------------------------------------------------------------------
//-- END OF HOME VIEW --------------------------------------------------------------------
