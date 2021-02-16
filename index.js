const RPC = require('discord-rpc');
const chalk = require('chalk');
const fs = require('fs')
const prompt = require('prompt-sync')();
const package = require(`./package.json`);

let showtip = false
let clsPvs = true

function header() {
    if(clsPvs == true) { console.clear() }
    console.log(chalk.bold(`${package.name}\n`))
    if (showtip == true){
            console.log(chalk.red('*') + ' - Required. Cannot be blank.\n' + chalk.green('*') + ' - Not required. Can be left blank. Press Enter to skip.\n')
        }
};

function init(options) {

    const client = new RPC.Client({ transport: 'ipc' })
    const activity = {}
    const assets = {}

    if (options.largeimage !== '') {
        assets.large_image = options.largeimage
        if (options.largeImagetext == ''){
            assets.large_text = `${package.name} by ${package.author}`
        }
        else {
            assets.large_text = options.largeImagetext
        }     
    }
    if (options.smallimage !== '') {
        assets.small_image = options.smallimage
        if (options.smallImagetext == ''){
            assets.small_text = `${package.repository.url}`
        }
        else {
            assets.small_text = options.smallImagetext
        }     
    }

    if (assets !== {}) {
        activity.assets = assets
    }
    if (options.description !== '') {
        activity.details = options.description
    }
    if (options.state !== '') {
        activity.state = options.state
    }
    if (options.buttons.length !== 0) {
        activity.buttons = options.buttons
    }

    client.on('ready', () => {
        client.request('SET_ACTIVITY', {
            pid: process.pid,
            activity: activity
        })

        showtip = false
        clsPvs = false
        header()
        console.log(chalk.green('Your rich presence has started.'))
    })

    client.login({ clientId: options.clientid })
};

function create() {

    function urlcheck (str) {
        const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
        return regexp.test(str)
    }

    let clientId = 0
    let largeImage = ''
    let largeImagetext = ''
    let smallImage = ''
    let smallImagetext = ''
    let description = ''
    let state = ''
    let buttoncount = 0
    let buttononelabel = ''
    let buttontwolabel = ''
    let buttononeurl = ''
    let buttontwourl = ''
    let isnum = false
    let isurl = false
    
    showtip = true
    header()

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

    header()
    largeImage = prompt(chalk.green('*') + ' Enter large image asset name: ')
    if(largeImage){
        largeImagetext = prompt(chalk.green('*') + ' Enter large image text: ')
        smallImage = prompt(chalk.green('*') + ' Enter small image asset name: ')
        if(smallImage){
            smallImagetext = prompt(chalk.green('*') + ' Enter small image text: ')
        }
    }

    header()
    description = prompt(chalk.green('*') + ' Enter the Details of your presence: ')
    state = prompt(chalk.green('*') + ' Enter the State of your presence: ')

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
        clientid: clientId,
        description: description,
        state: state,
        largeimage: largeImage,
        largeImagetext: largeImagetext,
        smallimage: smallImage,
        smallImagetext: smallImagetext,
        buttons: buttons
    }
    
    summary(content)

    const data = JSON.stringify(content, null, 2)

    fs.writeFile(`./rpc.json`, data, (err) => {
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
    console.log(`Client ID:         ${options.clientid}`)
    if (options.largeimage !== ''){ console.log(`Large Image Asset: ${options.largeimage}`) }
    if (options.largeimagetext) { console.log(`Large Image Text:  ${options.largeimagetext}`) } else { console.log(`Large Image Text:  ${package.name} by ${package.author} ` + chalk.bgGreen(' Default ')) }
    if (options.smallimage !== '') { console.log(`Small Image Asset: ${options.smallimage}`) }
    if (options.smallimagetext) { console.log(`Small Image Text:  ${options.smallimagetext}`) }
    if (options.description !== '') { console.log(`Details:           ${options.description}`) }
    if (options.state !== '') { console.log(`State:             ${options.state}`) }
    if (options.buttons[0]) {
        if (options.buttons[0].label) { console.log(`Button 1 Label:    ${options.buttons[0].label}`) }
        console.log(`Button 1 URL:      ${options.buttons[0].url}`)
        }
    if (options.buttons[1]) {
        if (options.buttons[1].label) { console.log(`Button 2 Label:    ${options.buttons[1].label}`) }
        console.log(`Button 2 URL:      ${options.buttons[1].url}`)
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