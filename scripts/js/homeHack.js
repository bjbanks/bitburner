/* Author: Bryson J. Banks */

// globals (affect all script instances)
let debug;

export async function main(ns) {
    // parse args
    let parsed = parseArgs(ns);
    if (parsed.length == 0) return 1;
    let target = parsed[0];
    let script = "/scripts/js/hack.js";

    // is script valid?
    if (!isScriptValid(ns, script)) return 1;

    // is target valid?
    if (!isTargetValid(ns, target)) return 1;

    // get RAM needed for script
    let scriptRam = ns.getScriptRam(script);
    if (debug) ns.tprint("..ram required = " + scriptRam);

    // check for running script
    if (ns.scriptRunning(script, "home")) {
        if (debug) ns.tprint("..found running script, killing");
        ns.scriptKill(script, "home");
    }

    // calc max possible threads to run
    var serverRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    var threads = Math.floor(serverRam / scriptRam);

    if (debug) {
        ns.tprint("..server ram = " + serverRam);
        ns.tprint("..thread count = " + threads);
    }

    // exec hack script
    await ns.exec(script, "home", threads, target);
}

// parse script arguments
function parseArgs(ns) {
    // check num args
    if (ns.args.length < 1) {
        ns.tprint("Error: missing arg <target>.");
        return [];
    }

    // arg[0] is target (required)
    let target = ns.args[0];

    // arg[1] is flag to turn on debug messages
    debug = (ns.args.length > 1 && ns.args[1]) ? true : false;

    if (debug) {
        ns.tprint("..target = " + target);
        ns.tprint("..debug = " + debug);
    }

    return [target];
}

// does target server exists and valid to hack?
function isTargetValid(ns, target) {
    if (!ns.serverExists(target)) {
        ns.tprint("Error: invalid target = " + target);
        return false;
    }
    if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
        ns.tprint("Error: hacking level too low for target.");
        return false;
    }
    return true;
}

// does hack script exists and valid?
function isScriptValid(ns, script) {
    if (!ns.fileExists(script)) {
        ns.tprint("Error: invalid script = " + script);
        return false;
    }
    return true;
}