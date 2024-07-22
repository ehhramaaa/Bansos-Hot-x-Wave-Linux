const { navigateUrl, clickElement, iframeHandling, iframeGetText, iframeClicker, iframeGetHeight } = require("./puppeteerHandle");
const { sleep, prettyConsole } = require('../utils/helper');

async function hotWallet(page, threshold) {
    await navigateUrl('https://web.telegram.org/k/#@herewalletbot', page)

    // Click Start Bot
    await clickElement('a.anchor-url[href="https://t.me/herewalletbot/app"]', page)

    // Click Launch
    await clickElement('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)', page)

    // Handle Iframe
    const iframe = await iframeHandling('.payment-verification', page)

    // Get Account Name
    const accountName = await iframeGetText('#root > div > div > div.sc-ifyrTC.kehHNg > div > div > div:nth-child(1) > div > p', iframe)

    if (accountName === undefined) {
        return
    }

    prettyConsole('success', `Account\t:${accountName}`)

    // Get Near Balance
    const nearBalance = parseFloat(await iframeGetText('#root > div > div > div.sc-ifyrTC.kehHNg > div > div > div:nth-child(6) > div:nth-child(2) > div.sc-drnuxz.gogwPM > div:last-child > p:last-of-type', iframe))

    prettyConsole('info', typeof(nearBalance))
    prettyConsole('success', `Near Balance\t:${nearBalance} $NEAR`)

    if (typeof(nearBalance) === "number") {
        return
    }


    // Get Hot Balance
    const hotBalance = parseFloat(await iframeGetText('#root > div > div > div.sc-ifyrTC.kehHNg > div > div > div:nth-child(6) > div:nth-child(1) > div > p.sc-gnpbhQ.exwOjV', iframe))

    if (typeof(hotBalance) === "number") {
        return
    }
    
    prettyConsole('success', `Balance\t:${hotBalance} $HOT🔥`)
    
    // Get Account Storage
    const storage = parseFloat(await iframeGetHeight('#root > div > div > div.sc-ifyrTC.kehHNg > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div', iframe))

    if (storage === undefined) {
        return
    }
    
    prettyConsole('success', `Storage\t:${storage}%`)
    
    if (storage >= threshold) {
        let reClaim = 0
        let isClaimed = false
        while (reClaim < 3 && !isClaimed) {
            try {
                // Click Storage Hot
                await iframeClicker('#root > div > div > div.sc-ifyrTC.kehHNg > div > div > div:nth-child(4) > div:nth-child(2)', page, iframe)
            } catch (error) {
                prettyConsole('error', error.message)
            }

            try {
                // Click Claim Hot
                await iframeClicker('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button', page, iframe)
            } catch (error) {
                prettyConsole('error', error.message)
            }

            let balanceAfter = 0
            let tryMakeSure = 0

            // Check Balance After Claim For Make Sure Claimed
            while (tryMakeSure <= 5 && balanceAfter <= hotBalance) {
                balanceAfter = parseFloat(await iframeGetText('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)', iframe))

                if (tryMakeSure === 3) {
                    prettyConsole('info', `Still Claiming $HOT🔥...')`)
                }

                tryMakeSure++

                await sleep(5000)
            }

            if (balanceAfter > hotBalance) {
                isClaimed = true
                prettyConsole('success', `Claim $HOT🔥 Successfully!`)
                prettyConsole(`Update Balance\t:${balanceAfter} $HOT🔥`)
            } else {
                reClaim++
                prettyConsole('error', `Failed Claiming $HOT🔥!!!`)
            }
        }
    } else {
        prettyConsole('error', `You Can Claim $HOT🔥 If Storage >= ${threshold}% `)
    }

    return [hotBalance, nearBalance];
}

async function waveWallet(page) {
    await navigateUrl('https://web.telegram.org/k/#@waveonsuibot', page)

    // Click Start Bot
    await clickElement('a.anchor-url[href="https://t.me/waveonsuibot/walletapp"]', page)

    // Click Launch
    await clickElement('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)', page)

    // Handle Iframe
    const iframe = await iframeHandling('.payment-verification', page)

    // Get Balance SUI
    const balanceSui = parseFloat(await iframeGetText('.p.wave_number', iframe))

    if (balanceSui === undefined) {
        return
    }

    prettyConsole('success', `Balance\t:${balanceSui} $SUI💧'`)

    // Click Claim Now
    await iframeClicker('.button.btn_claim', iframe)

    // Get Balance OCEAN
    const balanceOcean = parseFloat(await iframeGetText('.p.wave-balance', iframe))

    if (balanceOcean === undefined) {
        return
    }

    prettyConsole('success', `Balance\t:${balanceOcean} $OCEAN💎`)

    // Get Speed OCEAN
    const speed = parseFloat(await iframeGetText('.menu_2 > div > div > span.time', iframe))

    if (speed === undefined) {
        return
    }

    prettyConsole('success', `Speed\t:${speed} $OCEAN💎/Hours`)

    // Get Storage OCEAN
    const storage = parseFloat(await iframeGetText('.menu_1 > div > div > span.time', iframe))

    if (storage === undefined) {
        return
    }
    
    prettyConsole('success', `Max Storage\t:${storage} Hours`)
    
    let isClaimTime, isClaimed = false;
    
    // Check Claim Button
    try {
        await iframe.waitForSelector('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > button', { timeout: 5000 });
        isClaimTime = true
    } catch (error) {
        // Check Claim Time
        const claimTime = await iframeGetText(".span.boat_balance", iframe)
        
        prettyConsole('info', `Claim Countdown\t:${claimTime}`)
    }

    if (isClaimTime) {
        let reClaim = 0;
        while (reClaim < 3 && !isClaimed) {
            // Click Claim Button
            await iframeClicker('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > button', iframe)

            prettyConsole('info', `Claiming $OCEAN💎......`)

            // Check Status Claim
            let checkClaim = 0;
            while (checkClaim < 3 && !isClaimed) {
                try {
                    await iframe.waitForSelector('.span.boat_balance');
                    isClaimed = true
                } catch (error) {
                    prettyConsole(chalk.yellow(`Still Claiming ${chalk.cyan('$OCEAN💎')}......`))
                    checkClaim++
                }
            }

            if (!isClaimed) {
                prettyConsole('error', `Claiming $OCEAN💎 Failed!, Tweaking`)

                try {
                    await page.waitForSelector('.popup-close');
                } catch (error) {
                    prettyConsole('error', error.message)
                }

                try {
                    await page.click('.popup-close');
                } catch (error) {
                    prettyConsole('error', error.message)
                }

                reClaim++
            } else {
                prettyConsole('success', `Claim $OCEAN💎Successfully!`)
            }
        }

        if (!isClaimed) {
            prettyConsole('error', `Failed Claiming $OCEAN💎 After ${reClaim}x Retry`)
        }
    }

    return [balanceSui, balanceOcean]
}

module.exports = {
    hotWallet,
    waveWallet
}