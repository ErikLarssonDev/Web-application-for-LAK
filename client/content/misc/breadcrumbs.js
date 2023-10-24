//------------------
//-- BREADCRUMBS ---
//------------------
var allCrumbs = []

class breadCrumb {
    constructor(id, text, targetView){
        this.id = id
        this.text = text
        this.targetView = targetView
    }

    addPreviousCrumb() {
        var crumbLink = $('<a href="#"></a>')
        crumbLink.html(this.text)
        crumbLink.attr('onclick', this.targetView)
        var newCrumb = $('<li></li>')
        newCrumb.html(crumbLink).attr('id', this.id).addClass('breadcrumb-item')
        return newCrumb
    }

    addLastCrumb(){
        var newCrumb = $('<li></li>')
        newCrumb.addClass('breadcrumb-item active')
        newCrumb.attr('id', this.id).attr('aria-current', 'page').attr('targetView', this.targetView)
        newCrumb.text(this.text)
        return newCrumb
    }
}

// basically an array of breadcrumbs but need to store name of every list
class breadCrumbs {
    constructor(name, crumbs){
        this.name = name
        this.crumbs = crumbs
        this.length = crumbs.length
    }

    get(i){
        return this.crumbs[i]
    }
}

function createBreadcrumbs(){
    
    const home = new breadCrumb('homeCrumb', 'Hem', 'viewHome()')
    const posts = new breadCrumb('postsCrumb', 'Alla inlägg', 'viewOlderPosts()')
    const about = new breadCrumb('aboutCrumb', 'Om oss', 'viewAbout()')
    const protocols = new breadCrumb('protocolsCrumb', 'Årsmöteshandlingar', 'viewProtocols()')
    const events = new breadCrumb('eventCrumb', 'Händelser', 'viewEvents()')
    const faq = new breadCrumb('faqCrumb', 'Frågor och svar', 'viewFaq()')
    const contact = new breadCrumb('contactCrumb', 'Kontakt', 'viewContact()')
    const profile = new breadCrumb('profileCrumb', 'Min profil', 'viewProfile()')
    const profileBookings = new breadCrumb('profileBookingsCrumb', 'Mina bokningar', 'viewProfileBooking()')
    const profileMemberships = new breadCrumb('profileMembershipsCrumb', 'Mina medlemskap', 'viewProfileMembership()')
    const payment = new breadCrumb('paymentCrumb', 'Betalningshistorik', 'viewProfilePayment()')
    const profileSettings = new breadCrumb('profileSettingsCrumb', 'Inställningar', 'viewProfileSettings()')
    const admin = new breadCrumb('adminCrumb', 'Admin', 'viewAdmin()')
    const members = new breadCrumb('membersCrumb', 'Medlemmar', 'viewMembers()')
    const memberships = new breadCrumb('membershipsCrumb', 'Hantera medlemskap', 'viewMembershipsLibrary()')
    const newsLibrary = new breadCrumb('newsCrumb', 'Uppdatera nyheter', 'viewNewsLibrary()')
    const newsEdit = new breadCrumb('newsEditCrumb', 'Redigera nyheter', 'viewNewsEdit()')
    const newsLetter = new breadCrumb('newsletter', 'Nyhetsbrev', 'viewGetEmails()')
    const handleBookings = new breadCrumb('handleBookingsCrumb', 'Uppdatera event', 'viewHandleBookings()')
    const editInfo = new breadCrumb('editInfoCrumb', 'Uppdatera sajtinfo', 'viewEditSiteInfo()')
    const editDesign = new breadCrumb('editDesignCrumb', 'Uppdatera design', 'viewEditDesign()')
    const records = new breadCrumb('recordsCrumb', 'Klubbrekord', 'viewRecords()')
    const tags = new breadCrumb('tagsCrumb', 'Taggar', 'viewTags()')
    const adminPayments = new breadCrumb('adminPaymentsCrumb', 'Betalningshistorik', 'viewAllPayments()')



    allCrumbs.push(new breadCrumbs('home',[home]))
    allCrumbs.push(new breadCrumbs('allPosts',[home, posts]))
    allCrumbs.push(new breadCrumbs('about', [home, about]))
    allCrumbs.push(new breadCrumbs('protocols', [home, about, protocols]))
    allCrumbs.push(new breadCrumbs('events', [home, events]))
    allCrumbs.push(new breadCrumbs('faq', [home, faq]))
    allCrumbs.push(new breadCrumbs('contact', [home, contact]))
    allCrumbs.push(new breadCrumbs('records', [home, records]))
    allCrumbs.push(new breadCrumbs('profile', [home, profile]))
    allCrumbs.push(new breadCrumbs('profileBookings', [home, profile, profileBookings]))
    allCrumbs.push(new breadCrumbs('profileMemberships', [home, profile, profileMemberships]))
    allCrumbs.push(new breadCrumbs('payment', [home, profile, payment]))
    allCrumbs.push(new breadCrumbs('profileSettings', [home, profile, profileSettings]))
    allCrumbs.push(new breadCrumbs('admin', [home, admin]))
    allCrumbs.push(new breadCrumbs('members', [home, admin, members]))
    allCrumbs.push(new breadCrumbs('memberships', [home, admin, memberships]))
    allCrumbs.push(new breadCrumbs('newsLibrary', [home, admin, newsLibrary]))
    allCrumbs.push(new breadCrumbs('newsEdit', [home, admin, newsLibrary, newsEdit]))
    allCrumbs.push(new breadCrumbs('newsletter', [home, admin, newsLetter]))
    allCrumbs.push(new breadCrumbs('handleBookings', [home, admin, handleBookings]))
    allCrumbs.push(new breadCrumbs('editInfo', [home, admin, editInfo]))
    allCrumbs.push(new breadCrumbs('editDesign', [home, admin, editDesign]))
    allCrumbs.push(new breadCrumbs('tags', [home, admin, tags]))

    allCrumbs.push(new breadCrumbs('adminPayments', [home, admin, adminPayments]))
}

function findCrumbs(nameOfCrumbs){
    for (const crumbs of allCrumbs){
        if (crumbs.name == nameOfCrumbs){return crumbs}
    }
}

function updateCrumbs(target){
    $('.breadcrumb').empty()
    crumbsToAdd = findCrumbs(target)
    var newCrumbs = []

    for (let i = 0; i < crumbsToAdd.length-1;i++){
        newCrumbs.push(crumbsToAdd.get(i).addPreviousCrumb())
        $('.breadcrumb').append(newCrumbs[i]) // appends all crumbs to ol
    }
    newCrumbs.push(crumbsToAdd.get(crumbsToAdd.length-1).addLastCrumb())
    $('.breadcrumb').append(newCrumbs[newCrumbs.length-1])
}
//-- END OF BREADCRUMBS ---
//-------------------------