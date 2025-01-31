
let commands = {
    scrappy: "scrappy", // command | reaction 
    scrappyRetryReaction: "scrappy-retry", 
    scrappyParrotReaction: "scrappyparrot",
    scrappyHelp: "scrappy-help",
    scrappySetAudio: "scrappy-setaudio",
    scrappySetCSS: "scrappy-setcss",
    scrappySetDomain: "scrappy-setdomain",
    scrappyDisplayStreaks: "scrappy-displaystreaks",
    scrappySetUsername: "scrappy-setusername",
    scrappyToggleStreaks: "scrappy-togglestreaks",
    scrappyWebring: "scrappy-webring"
};

if (process.env.NODE_ENV === "staging") {
    for (let key of Object.keys(commands)) {
        commands[key] = "test-" + commands[key];
    }
}

export { commands };
