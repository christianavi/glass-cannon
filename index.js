const fs = require('fs')
const chalk = require('chalk');
const prompt = require('prompt-sync')();
const { Client } = require('discord-rpc');
const package = require(`./package.json`);
const { start } = require('repl');

let showtip = false

function header() {
    console.clear()
    console.log(chalk.bold(`${package.name} ` + chalk.dim(` ${package.version} `)))
    if (showtip == true){
            console.log(chalk.red('*') + ' - Required. Cannot be blank.\n' + chalk.green('*') + ' - Not required. Can be left blank. Press Enter to skip.\n')
        }
};

function init(options) {

    const client = new Client({ transport: 'ipc' })
    const activity = {}
    
    activity.clientId = options.clientId
    if (options.details !== '') { activity.details = options.details }
    if (options.state !== '') { activity.state = options.state }
    if (options.startTimestamp) {
        activity.startTimestamp = parseInt(options.startTimestamp)
        if (options.endTimestamp) { activity.endTimestamp = parseInt(options.endTimestamp) }
    }

    if (options.largeImageKey !== '') {
        activity.largeImageKey = options.largeImageKey
        if (options.largeImageText !== ''){
            activity.largeImageText = options.largeImageText    
        }
        else {
            activity.largeImageText = `${package.name} by ${package.author}`
        }     
    }
    if (options.smallImageKey !== '') {
        activity.smallImageKey = options.smallImageKey
        if (options.smallImageText !== ''){
            activity.smallImageText = options.smallImageText
        }
        else {
            activity.smallImageText = `${package.repository.url}`
        }     
    }
    if (options.partyId) { activity.partyId = options.partyId } 
    if (options.joinSecret && options.buttons[0]) {
        let response = 0
        header()
        console.log(chalk.yellow("It appears that the profile has both joinSecret and buttons. Secrets cannot currently be sent with buttons, so you will have to select which one to use.") + "\n1 - None\n2 - joinSecret " + chalk.dim('(Ask to join button)') + "\n3 - Buttons")
        response = Math.floor(prompt("Enter the number of your choice: "))
        if (response == '' || isNaN(response) || response < 1 || response > 3) { console.log("Invalid number. Defaulting to 1 - none.") }
        else if (response == 1) { }
        else if (response == 2) { activity.joinSecret = options.joinSecret }
        else if (response == 3) {
            activity.buttons = options.buttons
        }
        else { console.log(chalk.red('This is something I haven\'t forseen.')) }
    }
    else if (options.joinSecret) { activity.joinSecret = options.joinSecret }
    else if (options.buttons[0]) { activity.buttons = options.buttons }
    else { console.log(chalk.red('This is something I haven\'t forseen.')) }


    if (options.partySize && options.partyMax) {
        activity.partySize = parseInt(options.partySize)
        activity.partyMax = parseInt(options.partyMax)
    }

    activity.instance = false

    client.on('ready', () => {
        if (!activity.startTimestamp) {
            const startTimestamp = new Date();
            activity.startTimestamp = startTimestamp
        }
        client.setActivity(activity)
        showtip = false
        header()
        summary(activity)
        console.log(chalk.green('Your rich presence has started.'))
    })

    client.login({ clientId: activity.clientId })
};

function create() {

    function urlcheck (str) {
        const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
        return regexp.test(str)
    }

    let clientId = 0
    let details = ''
    let state = ''
    let startTimestamp = ''
    let endTimestamp = ''
    let largeImageKey = ''
    let largeImageText = ''
    let smallImageKey = ''
    let smallImageText = ''
    let partyId = ''
    let partySize = 0
    let partyMax = 0
    let joinSecret = 0
    let buttoncount = 0
    let buttononelabel = ''
    let buttontwolabel = ''
    let buttononeurl = ''
    let buttontwourl = ''
    let isnum = false
    let isurl = false
    
    showtip = true
    header()
    // clientId
    while(!isnum){
        clientId = prompt(chalk.red('*') + ' Enter Application Client ID: ' )
        if(clientId === '' || isNaN(clientId)){    
            header()
            console.log(chalk.red("Your Client ID has to be a number."))
        }
        else{
            isnum = true
        }
    }

    isnum = false
    
    header()
    details = prompt(chalk.green('* ') + 'Enter the Details of your presence: ')
    state = prompt(chalk.green('* ') + 'Enter the State of your presence: ')
 
    header()
    largeImageKey = prompt(chalk.green('* ') + 'Enter large image asset name: ')
    if(largeImageKey){
        largeImageText = prompt(chalk.green('* ' ) + 'Enter large image text: ')
        smallImageKey = prompt(chalk.green('* ') + 'Enter small image asset name: ')
        if(smallImageKey){
            smallImageText = prompt(chalk.green('* ') + 'Enter small image text: ')
        }
    }

    header()
    console.log("Timestamps are in Unix time. Go to " + chalk.underline('https://www.epochconverter.com/') + " to convert human readable time to Unix time.")
    startTimestamp = prompt(chalk.green('* ') + "Enter Start Timestamp: ")
    if (isNaN(startTimestamp)) {
        startTimestamp = ''
    }
    if (startTimestamp !== ''){
        endTimestamp = prompt(chalk.red('* ') + "Enter End Timestamp: ")
        if (isNaN(endTimestamp)) {
            startTimestamp = ''
            endTimestamp = ''
        }
    }

    header()
    partyId = prompt(chalk.green('* ') + 'Enter the your Party ID: ')
    if (partyId) {
        joinSecret = prompt(chalk.green('* ') + 'Enter your Join Secret: ')
    }

    header()
    partySize = prompt(chalk.green('* ') + 'Enter the Party Size: ')
    if (!isNaN(partySize)) {
        if (partySize) {
            while (!isnum) {
                partyMax = prompt(chalk.red('* ') + 'Enter the Party Max: ')
                if (partySize > partyMax) {
                    console.log(chalk.red("Party Max cannot exceed Party Size (" + partySize  + ")."))
                }
                if (isNaN(partyMax)) {
                    console.log(chalk.red(partyMax  + " is not a valid number."))
                }
                else { isnum = true }
            }
        }
    }
    else { partySize = 0 }

    header()
    buttoncount = Math.floor(prompt(chalk.green('* ') + "Enter the number of buttons you would want. (0-2) "))
    if (buttoncount === '' || isNaN(buttoncount) || buttoncount < 0) {
        buttoncount = 0
        console.log("Invalid number. Buttons set to 0.")
    } else if (buttoncount > 2) {
        buttoncount = 2
        console.log("You can only have up to 2 buttons. Buttons set to 2.")
    }
    if (buttoncount >= 1) {
        buttononelabel = prompt(chalk.green('* ') + "Enter button 1 label: ")
        if (buttononelabel === '') { buttononelabel = ' ' }
        while (!isurl) {
            buttononeurl = prompt(chalk.red('* ') + "Enter button 1 URL: ")
            if (!urlcheck(buttononeurl)) {
            console.log("Invalid URL.")
            } else { isurl = true }
        }
        if (!buttononeurl.startsWith('http')) { buttononeurl = 'https://' + buttononeurl }
    }
    if (buttoncount === 2) {
        buttontwolabel = prompt(chalk.green('* ') + "Enter button 2 label: ")
        if (buttontwolabel === '') { buttontwolabel = ' ' }
        isurl = false
        while (!isurl) {
            buttontwourl = prompt(chalk.red('* ') + "Enter button 2 URL: ")
            if (!urlcheck(buttontwourl)) { console.log("Invalid URL.") } else { isurl = true }
        }
        if (!buttontwourl.startsWith('http')) { buttontwourl = 'https://' + buttontwourl }
    }

    showtip = false
    header()
    

    let buttonone = null
    let buttontwo = null

    switch (buttoncount) {
	case 0:
		break
	case 1:
		buttonone = { label: buttononelabel, url: buttononeurl }
		break
	case 2:
		buttonone = { label: buttononelabel, url: buttononeurl }
		buttontwo = { label: buttontwolabel, url: buttontwourl }
		break
	default:
		console.error(chalk.red('Fatal error.'))
		process.exit()
    }

    const buttons = []
    if (buttonone !== null) { buttons.push(buttonone) }
    if (buttontwo !== null) { buttons.push(buttontwo) }

    const content = {
        clientId: clientId,
        details: details,
        state: state,
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp,
        largeImageKey: largeImageKey,
        largeImageText: largeImageText,
        smallImageKey: smallImageKey,
        smallImageText: smallImageText,
        partyId: partyId,
        partySize: partySize,
        partyMax: partyMax,
        joinSecret: joinSecret,
        buttons: buttons
    }
    
    summary(content)

    const data = JSON.stringify(content, null, 2)

    fs.writeFile('./rpc.json', data, (err) => {
        if (err) { throw err }
    })

    console.log(chalk.green('Rich presence saved.'))
    let response = ""
    response = prompt("Do you want to initialize rich presence now? (Y/N) " )
    if(response === "n" || response === "N"){
        return;
    }
    else {
        init(content)
    }
};

function summary(options) {
    // console.log(options)
    console.log(chalk.green('Rich Presence Summary'))
    console.log(`Client ID:         ${options.clientId}`)
    if (options.details !== '') { console.log(`Details:           ${options.details}`) }
    if (options.state) { console.log(`State:             ${options.state}`) } else { }
    if (options.largeImageKey !== ''){ console.log(`Large Image Asset: ${options.largeImageKey}`) }
    if (options.largeImageText) { console.log(`Large Image Text:  ${options.largeImageText}`) } else { console.log(`Large Image Text:  ${package.name} by ${package.author} ` + chalk.dim('Default')) }
    if (options.smallImageKey) { console.log(`Small Image Asset: ${options.smallImageKey}`) }
    if (options.smallImagetext) { console.log(`Small Image Text:  ${options.smallImagetext}`) }
    if (options.partyId) { console.log(`Party ID:          ${options.partyId}`) }
    if (options.joinSecret){ console.log(`Join secret:       ${options.joinSecret}`) }
    if (options.partySize) { console.log(`Party size:        ${options.partySize}`) }
    if (options.partyMax) { console.log(`Max party members: ${options.partyMax}`) }
    if (options.buttons) {
        if (options.buttons[0]) {
        if (options.buttons[0].label) { console.log(`Button 1 Label:    ${options.buttons[0].label}`) }
        console.log(`Button 1 URL:      ${options.buttons[0].url}`)
        }
        if (options.buttons[1]) {
            if (options.buttons[1].label) { console.log(`Button 2 Label:    ${options.buttons[1].label}`) }
            console.log(`Button 2 URL:      ${options.buttons[1].url}`)
        }
    }
    console.log() // Empty line
}

try {
    if(fs.existsSync('./rpc.json')) {
        const options = require(`./rpc.json`)
        // console.log(options)
        let response = ''
        showtip = false
        header()
        summary(options)
        
        response = prompt("Do you want to load the saved rich presence? (Y/N) ");
        if (response === "n" || response ===  "N") {
            create()
        }
        else {
            const options = require('./rpc.json');
            init(options)
        }
    } else {
        create()
    }
} catch (err) {
    console.error(err);
}