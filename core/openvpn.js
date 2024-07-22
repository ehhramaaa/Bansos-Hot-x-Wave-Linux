const { exec } = require("node:child_process");
const { prettyConsole } = require("../utils/helper");

async function startOpenVpn(openVpnPath, ovpnConfig, profileIndex) {
    return new Promise((resolve, reject) => {
        const openVpnProcess = exec(`doas openvpn --config ${openVpnPath}/${ovpnConfig[profileIndex]} --auth-user-pass ${openVpnPath}/auth.txt --ca ${openVpnPath}/ca.ipvanish.com.crt`);;

        openVpnProcess.stdout.on('data', (data) => {
            prettyConsole('info', data.toString())
            if (data.toString().includes('Initialization Sequence Completed')) {
                prettyConsole('success', "OpenVPN Started")
                resolve(true);
            }
        });

        openVpnProcess.stderr.on('data', (data) => {
            prettyConsole('error', data.toString())
        });

        openVpnProcess.on('error', (error) => {
            reject(error);
        });
    });
};

async function stopOpenVpn() {
    return new Promise((resolve, reject) => {
        const openVpnProcess = exec('killall openvpn')

        openVpnProcess.stdout.on("data", (data) => {
            if (data.toString().includes('SIGTERM received')) {
                prettyConsole('success', "OpenVPN Stopped")
                resolve(true)
            }
        })

        openVpnProcess.stderr.on("data", (data) => {
            prettyConsole('error', data.toString())
        })

        openVpnProcess.on('error', (error) => {
            prettyConsole('error', error)
            reject(false);
        });
    })
};

module.exports = {
    startOpenVpn,
    stopOpenVpn
}