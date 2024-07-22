const { sleep, prettyConsole } = require('../utils/helper');

async function searchSelector(selector, pageOrIframe) {
    let retrySearchSelector = 0;
    let isSelectorFound = false;
    while (retrySearchSelector < 3 && !isSelectorFound) {
        try {
            await pageOrIframe.waitForSelector(selector, { visible: true });
            isSelectorFound = true;
        } catch (error) {
            prettyConsole('error', error.message);
            retrySearchSelector++
        }
    }

    return isSelectorFound
}

async function navigateUrl(url, page) {
    try {
        await page.goto(url, { waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'] });
        await sleep(3000)
    } catch (error) {
        prettyConsole('error', error.message);
    }
}

async function clickElement(selector, page) {
    const isSelectorFound = await searchSelector(selector, page)

    if (isSelectorFound) {
        try {
            await sleep(3000)
            await page.click(selector)
            await sleep(3000)
        } catch (error) {
            prettyConsole('error', error.message);
        }
    }
}

async function iframeHandling(iframeSelector, page) {
    const isSelectorFound = await searchSelector(iframeSelector, page)

    if (isSelectorFound) {
        try {
            const iframeElementHandle = await page.$(iframeSelector);

            await sleep(3000)

            const iframe = await iframeElementHandle.contentFrame()

            return iframe;
        } catch (error) {
            prettyConsole('error', error.message);
        }
    }
}

async function iframeGetText(selector, iframe) {
    const isSelectorFound = await searchSelector(selector, iframe)

    if (isSelectorFound) {
        try {
            const text = await iframe.evaluate((element) => {
                return document.querySelector(element).textContent
            }, selector);

            return text;
        } catch (error) {
            prettyConsole('error', error.message);
        }
    }
}

async function iframeClicker(selector, iframe) {
    const isSelectorFound = await searchSelector(selector, iframe)

    if (isSelectorFound) {
        try {
            await iframe.evaluate((element) => {
                document.querySelector(element).click();
            }, selector);
        } catch (error) {
            prettyConsole('error', error.message);
        }
    }
}

async function iframeGetHeight(selector, iframe) {
    const isSelectorFound = await searchSelector(selector, iframe)

    if (isSelectorFound) {
        try {
            const value = await iframe.evaluate((element) => {
                const height = window.getComputedStyle(
                    document.querySelector(element)
                ).getPropertyValue(
                    "height"
                ).match(
                    /\d+(\.\d+)?/
                );

                return Math.floor(parseFloat(height[0]))
            }, selector);

            return value;
        } catch (error) {
            prettyConsole('error', error.message);
        }
    }
}

module.exports = {
    navigateUrl,
    clickElement,
    iframeHandling,
    iframeGetText,
    iframeClicker,
    iframeGetHeight
}