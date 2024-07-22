const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { exec } = require("node:child_process");
const chalk = require("chalk");
const prompt = require('prompt-sync')({ sigint: true });


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function rest() {
    const randomTime = (Math.random() * (30 - 15) + 15) * 1000
    prettyConsole('info', `Take rest for ${Math.floor(randomTime / 1000)} second\n`)
    await sleep(randomTime)
}

function prettyConsole(status, text) {
    if (status === "success") {
        console.log(chalk.green(`[${status.toUpperCase()}]`, text))
    } else if (status === "info") {
        console.log(chalk.whiteBright(`[${status.toUpperCase()}]`, text))
    } else {
        console.error(chalk.red(`[${status.toUpperCase()}]`, text))
    }
}

async function checkIp() {
    try {
        const response = await fetch(`https://freeipapi.com/api/json`);
        const data = await response.json();
        prettyConsole('info', `Current IP : ${data.ipAddress}`)
        return data.ipAddress;
    } catch (error) {
        prettyConsole('error', error);
        return false;
    }
}

async function stopChromium() {
    exec('killall chromium');
}

async function ovpnReadConfig(folderPath) {
    try {
        const config = fs.readdirSync(folderPath)
            .filter(file => path.extname(file) === '.ovpn')
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/), 10);
                const numB = parseInt(b.match(/\d+/), 10);

                return numA - numB;
            });

        return config;
    } catch (error) {
        prettyConsole('error', error);
    }
}

async function chromiumReadProfile(folderPath, folderName) {
    try {
        const profile = fs.readdirSync(folderPath)
            .filter(folder => fs.lstatSync(path.join(folderPath, folder)).isDirectory() && new RegExp(`${folderName}`).test(folder))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || 0, 10);
                const numB = parseInt(b.match(/\d+/)?.[0] || 0, 10);

                return numA - numB;
            });

        return profile;
    } catch (error) {
        prettyConsole('error', error);
    }
}

const askQuestionWithTimeout = (question, timeout) => {
    const defaultAnswer = 'y';
    return new Promise((resolve) => {
        let resolved = false;
        const timer = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve(true);
            }
        }, timeout);

        let answer;
        while (!resolved) {
            answer = prompt(question, defaultAnswer).trim().toLowerCase();
            if (answer === 'y' || answer === 'n' || answer === '') {
                clearTimeout(timer);
                resolved = true;
                resolve(answer === 'y' || answer === '' ? true : false);
            } else {
                console.log("Please answer with 'y' or 'n'.");
            }
        }
    });
};

module.exports = {
    prettyConsole,
    checkIp,
    stopChromium,
    ovpnReadConfig,
    chromiumReadProfile,
    rest,
    sleep,
    askQuestionWithTimeout
}