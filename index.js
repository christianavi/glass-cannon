const RPC = require('discord-rpc');
const chalk = require('chalk');
const fs = require('fs')
const prompt = require('prompt-sync')();
const manifest = require(`./package.json`);

let showtip = false
function header() {
    console.clear()
    console.log(chalk.bold(`${manifest.name} by ${manifest.author}\n`))
    if (showtip == true){
            console.log(chalk.red('*') + ' - Required. Cannot be blank.\n' + chalk.green('*') + ' - Not required. Can be left blank. Press Enter to skip.\n')
        }
}

function init() {
    const client = new RPC.Client({ transport: 'ipc' })
    const options = require(`./rpc.json`)

    const activity = {}
    const assets = {}

    if (options.largeimage !== '') {
        assets.large_image = options.largeimage
        if (options.largeImagetext == ''){
            assets.large_text = `${manifest.name} by ${manifest.author}`
        }
        else {
            assets.large_text = options.largeImagetext
        }     
    }
    if (options.smallimage !== '') {
        assets.small_image = options.smallimage
        if (options.smallImagetext == ''){
            assets.small_text = `By Christian Avi Bulan`
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

    client.on('ready', () => {
        client.request('SET_ACTIVITY', {
            pid: process.pid,
            activity: activity
        })

        console.clear()
        console.log(chalk.bold('cookies-and-cream by Christian Avi Bulan\n') + chalk.green('Your rich presence has started.'))
    })

    client.login({ clientId: options.clientid })
}

function create() {

    let clientId = 0
    let largeImage = ''
    let largeImagetext = ''
    let smallImage = ''
    let smallImagetext = ''
    let description = ''
    let state = ''
    let isnum = false
    
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

    showtip = false
    header()
    console.log(chalk.bold('cookies-and-cream by Christian Avi Bulan\n\n') + 'Rich Presence Summary')

    console.log(`Client ID:         ${clientId}\nLarge Image Asset: ${largeImage}\nLarge Image Text:  ${largeImagetext}\nSmall Image Asset: ${smallImage}\nSmall Image Text:  ${smallImagetext}\nDetails:           ${description}\nState:             ${state}`)


    const content = {
        clientid: clientId,
        description: description,
        state: state,
        largeimage: largeImage,
        largeImagetext: largeImagetext,
        smallimage: smallImage,
        smallImagetext: smallImagetext
    }

    // console.log(content)
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
        
        const client = new RPC.Client({ transport: 'ipc' })
        const options = content

        const activity = {}
        const assets = {}

        console.log(options)
        if (options.largeimage !== '') {
            assets.large_image = options.largeimage
            if (options.largeImagetext == ''){
                assets.large_text = "Cookies and Cream by Christian Avi Bulan"
            }
            else {
                assets.large_text = options.largeImagetext
            }
        }
        if (options.smallimage !== '') {
            assets.small_image = options.smallimage
            if (options.smallImagetext == '') {
                assets.small_text = 'https://github.com/christianavi'
            }
            else {
                assets.small_text = options.smallImagetext
            }
        }
        if (assets !== {}) { activity.assets = assets }
        if (options.description !== '') { activity.details = options.description }
        if (options.state !== '') { activity.state = options.state }
        client.on('ready', () => {
            client.request('SET_ACTIVITY', {
                pid: process.pid,
                activity: activity
            })
            console.clear()
            showtip = false
            header()
            console.log(chalk.green('Your rich presence has started.'))
        })

        client.login({ clientId: options.clientid })
        
    }

};

try {
    if(fs.existsSync('./rpc.json')) {
        const options = require(`./rpc.json`)
        let response = ''
        showtip = false
        header()
        console.log(`Client ID:         ${options.clientid}\nLarge Image Asset: ${options.largeimage}\nLarge Image Text:  ${options.largeimagetext}\nSmall Image Asset: ${options.smallimage}\nSmall Image Text:  ${options.smallimagetext}\nDetails:           ${options.description}\nState:             ${options.state}`)
        response = prompt("Do you want to load the saved rich presence? (Y/N) ");
        if (response === "n" || response ===  "N") {
            create()
        }
        else {
            init()
        }
    } else {
        create()
    }
} catch (err) {
    console.error(err);
}