const os = require("os");

const { chromiumReadProfile } = require("./utils/helper");
const profilePath = `${os.homedir()}/.config/chromium`;
const profileFolderName = "Bansos";

(async () => {
    const profileChromium = await chromiumReadProfile(profilePath, profileFolderName)
    console.log(profileChromium)
})()
