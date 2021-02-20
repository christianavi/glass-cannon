// const dir = `${os.userInfo().homedir}/${process.platform === 'win32' ? '/AppData/Roaming' : '/.config'}`
const os = require('os');
const fs = require('fs');
console.log(os.homedir)

const dir = os.homedir()

const yes = `${dir}/mkdir`

// fs.mkdir(yes, (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log("Directory is created.");
// });

console.log(process.platform)

// const directory = 