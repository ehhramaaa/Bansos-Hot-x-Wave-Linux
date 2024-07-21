const puppeteer = require("puppeteer");
const os = require("os");
const { startOpenVpn, stopOpenVpn } = require("./core/openvpn")
const { hotWallet, waveWallet } = require("./core/bot")
const { sleep, prettyConsole, checkIp, stopChromium, ovpnReadConfig, chromiumReadProfile, rest} = require('./utils/helper')
require('dotenv').config();

const openVpnPath = process.env.OPEN_VPN_PATH;
const profileFolderName = process.env.CHROMIUM_PROFILE_NAMING;
const hotThreshold = process.env.HOT_MINIMAL_STORAGE_CLAIM;
const chromiumExecPath = process.env.CHROMIUM_EXECUTABLE_PATH;
const chromiumUserPath = `${os.homedir()}/.config/chromium`;

(async () => {
    let totalBalanceNear = 0
    let totalBalanceHot = 0
    let totalBalanceOcean= 0
    let totalBalanceSui = 0

    const ovpnConfig = await ovpnReadConfig(openVpnPath)
    const profileChromium = await chromiumReadProfile(chromiumUserPath, profileFolderName)
    let profileIndex = 0;
    for (const profile of profileChromium) {
        console.log(chalk.cyan(`\n<==============================[${profile[profileIndex]}]==============================>`))

        await stopChromium()

        await stopOpenVpn()

        await sleep(3000)

        await checkIp()

        const isVpnConnect = await startOpenVpn(openVpnPath, ovpnConfig, profileIndex)

        if (isVpnConnect) {
            prettyConsole('success',"VPN connected successfully!")
            await checkIp();
        } else {
            await rest()
            continue
        }

        let launchOptions = {
            executablePath : chromiumExecPath,
            headless: true,
            args: [
                `--user-data-dir=${chromiumUserPath}`,
                `--profile-directory=${profile}`
            ]
        };

        const browser = await puppeteer.launch(launchOptions)

        await sleep(3000)

        prettyConsole('info', `Profile\t:${profile}`)
        
        const page = await browser.newPage();
        await page.setDefaultTimeout(60000);
        
        const balanceHot = await hotWallet(page, hotThreshold)
        totalBalanceHot = totalBalanceHot + balanceHot
        
        const [balanceSui, balanceOcean] = await waveWallet(page)
        totalBalanceSui = totalBalanceSui + balanceSui
        totalBalanceOcean = totalBalanceOcean + balanceOcean

        await stopOpenVpn()
        await rest()
    }
})()
