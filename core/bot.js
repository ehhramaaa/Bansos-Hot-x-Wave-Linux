const { navigateUrl, clickElement, iframeHandling, iframeGetText, iframeClicker } = require("./puppeteerHandle");
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
    const accountName = await iframeGetText('#root > div > div > div:nth-child(1) > div > div > div:nth-child(1) > p', iframe)

    prettyConsole('success', `Account\t:${accountName}`)

    // Get Account Balance
    const balance = parseFloat(await iframeGetText('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div > p', iframe))

    prettyConsole('success', `Balance :${balance} $HOT🔥`)

    // Get Account Storage
    const storage = parseFloat(await iframeGetText('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div', iframe))

    prettyConsole('success', `Storage \t:${storage}%`)

    if (storage >= threshold) {
        // Click Storage Hot
        await iframeClicker('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(2)', page, iframe)

        // Click Claim Hot
        await iframeClicker('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button', page, iframe)

        let balanceAfter = 0
        let tryMakeSure = 0

        // Check Balance After Claim For Make Sure Claimed
        while (tryMakeSure <= 5 && balanceAfter <= balance) {
            balanceAfter = parseFloat(await iframeGetText('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)', iframe))

            if (tryMakeSure === 3) {
                prettyConsole('info', `Still Claiming $HOT🔥...')`)
            }

            tryMakeSure++

            await sleep(5000)
        }

        if (balanceAfter > balance) {
            prettyConsole('success', `Claim $HOT🔥 Successfully!`)
            prettyConsole(`Update Balance\t:${balanceAfter} $HOT🔥`)
        } else {
            prettyConsole('error', `Failed Claiming $HOT🔥!!!`)
        }
    } else {
        prettyConsole('error', `You Can Claim $HOT🔥 If Storage >= ${threshold}% `)
    }

    return balance;
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
    const balanceSui = parseFloat(await iframeGetText('div.portfolio_block > div:nth-child(2) > div > div:nth-child(1) > p.wave_number', iframe))

    prettyConsole('success', `Balance\t:${balanceSui} $SUI💧'`)

    // Click Claim Now
    await iframeClicker('#section-home > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > button', iframe)

    // Get Balance OCEAN
    const balanceOcean = parseFloat(await iframeGetText('#section-transaction > div > div > div > button > p', iframe))

    prettyConsole('success', `Balance\t:${balanceOcean} $OCEAN💎`)

    // Get Speed OCEAN
    const speed = parseFloat(await iframeGetText('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time', iframe))

    prettyConsole('success', `Speed\t:${speed} $OCEAN💎/Hours`)

    // Get Storage OCEAN
    const storage = parseFloat(await iframeGetText('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time', iframe))

    prettyConsole('success', `Max Storage\t:${storage} Hours`)

    let isClaimTime, isClaimed = false;

    // Check Claim Button
    try {
        await iframe.waitForSelector('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > button', { timeout: 5000 });
        isClaimTime = true
    } catch (error) {
        // Check Claim Time
        const claimTime = await iframeGetText("#section-transaction > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > span", iframe)

        prettyConsole('info', `Claim Countdown:${claimTime}`)
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
                    await iframe.waitForSelector('#section-transaction > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > span');
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