function viewOlderPosts() {
    sessionStorage.setItem('current_view', 'viewOlderPosts()')
    updateCrumbs('allPosts')

    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#navbarSupportedContent').find('span').removeClass('active-nav-link')
    $('#home-link').children().addClass('active-nav-link')

    $("#container").load("/content/home/older_posts/older_posts.html", function () {
        getPosts(showAllPosts)
    })
}

function showAllPosts(posts){
    posts.sort(comparePosts)
    for (const post of posts){
        $('#all-posts').append(createPost(post))
    }
}