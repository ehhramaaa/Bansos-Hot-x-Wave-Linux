const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { exec } = require("node:child_process");
const chalk = require("chalk");
const readline = require('readline');


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

async function askQuestionWithTimeout(question, timeout) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const timer = setTimeout(() => {
            rl.close();
            resolve('y');
        }, timeout);

        rl.question(question, (answer) => {
            clearTimeout(timer);
            rl.close();
            resolve(answer.trim().toLowerCase() || 'y');
        });
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