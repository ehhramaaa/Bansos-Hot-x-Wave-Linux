const { exec } = require("node:child_process");
const { prettyConsole } = require("../utils/helper");

async function startOpenVpn(openVpnPath, ovpnConfig, profileIndex) {
    return new Promise((resolve, reject) => {
        const openVpnProcess = exec(`doas openvpn --config ${openVpnPath}/${ovpnConfig[profileIndex]} --auth-user-pass ${openVpnPath}/auth.txt --ca ${openVpnPath}/ca.ipvanish.com.crt`);;

        openVpnProcess.stdout.on('data', (data) => {
            if (data.toString().includes('Initialization Sequence Completed')) {
                prettyConsole('success', "OpenVPN Started")
                resolve(true);
            }
            if (data.toString().includes("AUTH_FAILED")){
                prettyConsole('error', "OpenVPN Auth Failed, Please Check Credentials")
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
    try {
        exec('killall openvpn')
    } catch (error) {
        prettyConsole('error', error.message);
    }
};

module.exports = {
    startOpenVpn,
    stopOpenVpn
}