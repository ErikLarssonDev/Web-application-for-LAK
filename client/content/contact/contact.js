//Contact us
function viewContact() {
    sessionStorage.setItem('current_view', 'viewContact()')
    updateCrumbs('contact')
    $('#navbarSupportedContent').find('li').each(function(){
        $(this).children().removeClass('active-nav-link')
    })
    $('#navbarSupportedContent').find('span').removeClass('active-nav-link')
    $('#contact-link').children().addClass('active-nav-link')

    $("#container").load("/content/contact/contact.html", function () {
        $.when(getOpeningHours()).done(showOpeningHours)
        $.when(getContactData()).done(showContactInfo)
    });
}

// Gets the opening hours for all days with the ajax call

function getOpeningHours() {
    return $.ajax({
        type: "GET",
        url: host + "opening_hours",
        contentType: "application/json",
        error: function () {
            alert("kunde inte hämta öppningstiderna :(")
        }
    })
}

// Gets the all contactdata with the ajax call

function getContactData() {
    return $.ajax({
        type: "GET",
        url: host + "associations",
        contentType: "application/json",
        error: function () {
            alert("kunde inte hämta företagsuppgifterna :(")
        }
    })
}

function getMapData(streetAddress, cityAddress) {
    return $.ajax({
        type: "GET",
        url: 'https://nominatim.openstreetmap.org/search?q=' + cityAddress + ',' + streetAddress + '&limit=2&format=json',
        dataType: "json",
        success: function (data) {
        },
        error: function () {
            alert("kunde inte hämta :(")
        }
    })
}

function showOpeningHours(opening_hours) {
    var hourArray = []
    for (const dailyOpeningHour of opening_hours) {
        hourArray.push(dailyOpeningHour)
    }
    for (let i = 0; i < 7; i++) {
        if (i == 6) {
            $('#openingTime-content').append(createOpeningHours(hourArray[i]))
        }
        else if (hourArray[i].open_time != hourArray[i + 1].open_time || hourArray[i].close_time != hourArray[i + 1].close_time) {
            $('#openingTime-content').append(createOpeningHours(hourArray[i]))
        } else {
            for (let j = i + 1; j < 7; j++) {
                if (j == 6) {
                    $('#openingTime-content').append(createCombinedOpeningHours(hourArray[i], hourArray[j]))
                    i=8
                } 
                else if (hourArray[i].open_time == hourArray[j].open_time && hourArray[i].close_time == hourArray[j].close_time && (hourArray[i].open_time != hourArray[j + 1].open_time || hourArray[i].close_time != hourArray[j + 1].close_time)) {
                    $('#openingTime-content').append(createCombinedOpeningHours(hourArray[i], hourArray[j]))
                    i = j
                    break
                }
            }
        }
    }
}

function showContactInfo(association) {
    for (const associationInfo of association) {
        $('#contactInfo-list').append(createContactData(associationInfo))
        $.when(getMapData(associationInfo.address, associationInfo.district)).done(createMap)
    }
}

function createCombinedOpeningHours(dailyOpeningHours1, dailyOpeningHours2) {
    var dailyOpeningHoursItem = $('<li></li>').addClass('list-group-item')
    var dailyOpeningHoursContent = $('<p align="center"></p>').html(dailyOpeningHours1.day + " - " + dailyOpeningHours2.day + ":    " + dailyOpeningHours1.open_time + " - " + dailyOpeningHours1.close_time)
    dailyOpeningHoursItem.append(dailyOpeningHoursContent)
    return dailyOpeningHoursItem
}

function createOpeningHours(dailyOpeningHours) {
    var dailyOpeningHoursItem = $('<li></li>').addClass('list-group-item')
    var dailyOpeningHoursContent = $('<p align="center"></p>').html(dailyOpeningHours.day + ":    " + dailyOpeningHours.open_time + " - " + dailyOpeningHours.close_time)
    dailyOpeningHoursItem.append(dailyOpeningHoursContent)
    return dailyOpeningHoursItem
}

function createContactData(associationInfo) {
    $('#map-header').html("Adress: "+associationInfo.address+" "+associationInfo.zip_code+" "+associationInfo.district)

    var associationInfoItem = $('<div style="overflow-wrap:break-word;"></div>').addClass('mb-4 mt-4')
    var associationInfoContact1=($('<p><a href="mailto:' + associationInfo.email + '"><i class="fa fa-envelope-o"></i>' + associationInfo.email + '</a></p>'))
    var associationInfoContact2=($('<p><a href="telto:' + associationInfo.tel + '"><i class="fa fa-phone"></i>' + associationInfo.tel + '</a></p>'))
    var associationInfoContact3=($('<p><a href="' + associationInfo.facebook + '"><i class="fa fa-facebook-square"></i>'+(associationInfo.facebook).substr(25,(associationInfo.facebook.length-26))+'</a></p>'))
    var associationInfoContact4=($('<p><a href="' + associationInfo.instagram + '"><i class="fa fa-instagram"></i>'+ (associationInfo.instagram).substr(26,(associationInfo.instagram.length-27)) +'</a></p>'))
    
    return (associationInfoItem.append(associationInfoContact1).append(associationInfoContact2).append(associationInfoContact3).append(associationInfoContact4))
}

function createMap(data) {
    for (data2 in data) {
        lat = (data[data2]['lat'])
        lon = (data[data2]['lon'])
    }
    $('#map-content').append('<iframe frameborder = "0" style = "border:0" allowfullscreen src = "https://www.openstreetmap.org/export/embed.html?bbox=' + lon + '%2C' + lat + '&amp;layer=mapnik" style = "border: 1px solid black" ></iframe ><br /><small></small>')
    var bigMap = $('<p><a href="https://www.openstreetmap.org/#map=18/' + lat + '/' + lon + '">Visa större karta</a></p>')
    $('#map-big-content').append(bigMap)
}