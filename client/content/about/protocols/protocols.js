function viewProtocols(){
    sessionStorage.setItem('current_view', 'viewProtocols()')
    updateCrumbs('protocols')
    $("#container").load("/content/about/protocols/protocols.html", function () {
        $.when(getCategories()).done(function(categories){
            getProtocols(categories, showProtocols)
        })
    })
}

function getProtocols(categories, showProtocols) {
    var categoryID
    for (const category of categories) {
        if (category.name == "year-protocol") { categoryID = category.id }
    }
    if (categoryID != undefined) {
        
        getFilesInCategory(categoryID, showProtocols)
    }
}

function showProtocols(protocols) {
    const sortedProtocols = protocols.sort(compareProtocols)
    if (sortedProtocols != undefined) {
        for (const protocol of protocols) {
            link = $('<a></a>').attr('href', protocol.src).attr('target', 'blank')
            link.html(protocol.name)
            link.addClass('list-group-item')
            $('#year-protocols-list').append(link)
        }
    }
}

//sorts the events according to when the events take place
function compareProtocols(a, b){
    const firstA = a.name.length-14
    const firstB = b.name.length-14
    const lastA = a.name.length-4
    const lastB = b.name.length-4

    aDate = new Date(a.name.slice(firstA, lastA))
    bDate = new Date(b.name.slice(firstB, lastB))
    if (aDate > bDate) {return -1}
    else if (aDate < bDate) {return 1}
    return 0
}