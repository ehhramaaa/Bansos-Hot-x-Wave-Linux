const { sleep, prettyConsole } = require('../utils/helper');

async function navigateUrl(url, page) {
    try {
        await page.goto(url, { waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'] });
        await sleep(3000)
    } catch (error) {
        prettyConsole('error', error.message);
    }
}

async function clickElement(selector, page) {
    try {
        await page.waitForSelector(selector)
        await sleep(3000)
        await page.click(selector)
        await sleep(3000)
    } catch (error) {
        prettyConsole('error', error.message);
    }
}

async function iframeHandling(iframeSelector, page) {
    try {
        await page.waitForSelector(iframeSelector)
        const iframeElementHandle = await page.$(iframeSelector);

        await sleep(3000)

        return iframeElementHandle
    } catch (error) {
        prettyConsole('error', error.message);
    }
}

async function iframeGetText(selector, iframe) {
    try {
        await iframe.waitForSelector(selector);

        const text = await iframe.evaluate(() => {
            const element = document.querySelector(selector);
            return element.textContent
        });

        return text;

    } catch (error) {
        prettyConsole('error', error.message);
    }
}

async function iframeClicker(selector, iframe) {
    try {
        await iframe.waitForSelector(selector);

        await iframe.evaluate(() => {
            document.querySelector(selector).click();
        });
    } catch (error) {
        prettyConsole('error', error.message);
    }
}

async function iframeGetHeight(selector, iframe) {
    try {
        await iframe.waitForSelector(selector);

        const height = await iframe.evaluate(() => {
            return window.getComputedStyle(selector).height;
        });

        return height;

    } catch (error) {
        prettyConsole('error', error.message);
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