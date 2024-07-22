const puppeteer = require("puppeteer");
const os = require("os");
const { startOpenVpn, stopOpenVpn } = require("./core/openvpn")
const { hotWallet, waveWallet } = require("./core/bot")
const { sleep, prettyConsole, checkIp, stopChromium, ovpnReadConfig, chromiumReadProfile, rest, askQuestionWithTimeout } = require('./utils/helper')
require('dotenv').config();

const openVpnPath = process.env.OPEN_VPN_PATH;
const profileFolderName = process.env.CHROMIUM_PROFILE_NAMING;
const hotThreshold = process.env.HOT_MINIMAL_STORAGE_CLAIM;
const chromiumExecPath = process.env.CHROMIUM_EXECUTABLE_PATH;
const chromiumUserPath = `${os.homedir()}/.config/chromium`;

(async () => {
    let totalBalanceNear = 0
    let totalBalanceHot = 0
    let totalBalanceOcean = 0
    let totalBalanceSui = 0
    let ovpnConfig

    const isUseVpn = await askQuestionWithTimeout("Use OpenVpn?(y/n)[default:y] : ", 5000)

    isUseVpn ? ovpnConfig = await ovpnReadConfig(openVpnPath) : null;

    const profileChromium = await chromiumReadProfile(chromiumUserPath, profileFolderName)

    let profileIndex = 0;
    for (const profile of profileChromium) {
        console.log(`\n<==============================[${profile}]==============================>`)

        await stopChromium()

        await stopOpenVpn();

        if (isUseVpn) {
            const isVpnConnect = await startOpenVpn(openVpnPath, ovpnConfig, profileIndex);

            if (isVpnConnect) {
                prettyConsole('success', "VPN connected successfully!")
                await checkIp();
            } else {
                await rest()
                continue
            }
        }


        let launchOptions = {
            executablePath: chromiumExecPath,
            headless: false,
            args: [
                `--user-data-dir=${chromiumUserPath}`,
                `--profile-directory=${profile}`
            ]
        };

        const browser = await puppeteer.launch(launchOptions)

        await sleep(3000)

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0)
        await page.setDefaultTimeout(15000);

        try {
            const [hotBalance, nearBalance] = await hotWallet(page, hotThreshold)
    
            if (typeof hotBalance === "number") {
                totalBalanceHot = totalBalanceHot + balanceHot
                prettyConsole('info', `Total Balance Hot\t:${totalBalanceHot} $HOT🔥`)
            }
            
            if (typeof nearBalance === "number") {
                totalBalanceNear = totalBalanceNear + nearBalance
                prettyConsole('info', `Total Balance Near\t:${totalBalanceNear} $NEAR`)
            }
        } catch (error) {
            prettyConsole('error', error.message)
        }

        try {
            // Close Popup Iframe
            const popupSelector = 'body > div.popup.popup-payment.popup-payment-verification.popup-web-app.active'
            await page.waitForSelector(popupSelector)
            await page.click(popupSelector)
        } catch (error) {
            prettyConsole('error', error.message)
        }
        
        try {
            const [balanceSui, balanceOcean] = await waveWallet(page)
            
            
            if (typeof balanceSui === "number") {
                totalBalanceSui = totalBalanceSui + balanceSui
                prettyConsole('info', `Total Balance SUI\t:${totalBalanceSui} $SUI💧`)
            }
            
            if (typeof balanceOcean === "number") {
                totalBalanceOcean = totalBalanceOcean + balanceOcean
                prettyConsole('info', `Total Balance Ocean\t:${totalBalanceOcean} $OCEAN💎`)
            }
        } catch (error) {
            prettyConsole('error', error.message)
        }

        await rest()
    }
})()
