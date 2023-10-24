function setColors(association) {
    var ass
    if (association[0] != undefined) {
        ass = association[0]
    } else {
        ass = association
    }
    const darkPrimary = calclulateDarkerColor(ass.primary_color)
    const darkSecondary = calclulateDarkerColor(ass.secondary_color)
    const darkestSecondary = calclulateDarkerColor(darkSecondary)
    const darkestPrimary = calclulateDarkerColor(darkPrimary)
    const rgbPrimary = convertToRGB(ass.primary_color.slice(1,7))
    const rgbSecondary = convertToRGB(ass.secondary_color.slice(1,7))
    const darkGrey = '#323232'
    var textInButtons
    var contrastPrimary
    var contrastSecondary
    var contrastLinks

    if (rgbPrimary.r + rgbPrimary.g + rgbPrimary.b > 400){
        contrastPrimary = darkGrey
        contrastPrimaryOnWhite = darkGrey
    } else {
        contrastPrimary = '#ffffff'
        contrastPrimaryOnWhite = ass.primary_color
    }


    if (rgbSecondary.r + rgbSecondary.g + rgbSecondary.b > 450){
        contrastSecondary = darkGrey
        contrastLinks = ass.primary_color
    } else {
        contrastSecondary = '#ffffff'
        contrastLinks = ass.secondary_color
    }

    document.documentElement.style.setProperty("--primary-color", ass.primary_color)
    document.documentElement.style.setProperty("--dark-primary", darkPrimary)
    document.documentElement.style.setProperty("--secondary-color", ass.secondary_color)
    document.documentElement.style.setProperty("--dark-secondary", darkSecondary)
    document.documentElement.style.setProperty("--darkest-secondary", darkestSecondary)
    document.documentElement.style.setProperty("--darkest-primary", darkestPrimary)
    document.documentElement.style.setProperty("--contrast-primary", contrastPrimary)
    document.documentElement.style.setProperty("--contrast-primary-on-white", contrastPrimaryOnWhite)
    document.documentElement.style.setProperty("--contrast-links", contrastLinks)
}

function convertToRGB(hex){
  return {
    r: parseInt(hex.slice(0,2), 16),
    g: parseInt(hex.slice(2,4), 16),
    b: parseInt(hex.slice(4,6), 16)
  }
}


function calclulateDarkerColor(color){
    const trueColor = color.slice(1,7)
    var newColor = []
    var i = 0;

    for (const char of trueColor){
        if (parseInt(char, 16) > 1){
            newHexChar = (parseInt(char, 16)-2).toString(16)
            newColor[i] = newHexChar
        } else if (parseInt(char, 16) > 9){
            newHexChar = (parseInt(char, 16)-1).toString(16)
            newColor[i] = newHexChar
        } else {
            newColor[i] = char
        }
        i+=1
    }
    return'#'+ newColor.join('')

}