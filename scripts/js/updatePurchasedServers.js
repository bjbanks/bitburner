/* Author: Bryson J. Banks */

// globals (affect all script instances)
let debug;

export async function main(ns) {
    // parse args
    let parsed = parseArgs(ns);
    if (parsed.length == 0) return 1;
    let script = parsed[0];
    let target = parsed[1];

    // is script valid?
    if (!isScriptValid(ns, script)) return 1;

    // is target valid?
    if (!isTargetValid(ns, target)) return 1;

    // get RAM needed for script
    let scriptRam = ns.getScriptRam(script);
    if (debug) ns.tprint("..ram required = " + scriptRam);

    for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
        var serv = "pserv-" + i;
        if (debug) ns.tprint("..server = " + serv);
        
        // check if server even exists
        if (!ns.serverExists(serv)) {
            if (debug) ns.tprint("..does not exists, skipping");
            continue;
        }
    
        // check for running script
        if (ns.scriptRunning(script, serv)) {
            if (debug) ns.tprint("..found running script, killing");
            ns.scriptKill(script, serv);
        }
    
        // calc max possible threads to run
        let serverRam = ns.getServerMaxRam(serv);
        let threads = Math.floor(serverRam / scriptRam);
    
        if (debug) {
            ns.tprint("..server ram = " + serverRam);
            ns.tprint("..thread count = " + threads);
        }
    
        // copy over new script and execute it
        await ns.scp(script, serv);
        await ns.exec(script, serv, threads, target);
    }
}

// parse script arguments
function parseArgs(ns) {
    // check num args
    if (ns.args.length < 2) {
        ns.tprint("Error: missing arg.");
        return [];
    }

    // arg[0] is hack script (required)
    let script = ns.args[0];

    // arg[1] is target (required)
    let target = ns.args[1];

    // arg[2] is flag to turn on debug messages
    debug = (ns.args.length > 2 && ns.args[2]) ? true : false;

    if (debug) {
        ns.tprint("..script = " + script);
        ns.tprint("..target = " + target);
        ns.tprint("..debug = " + debug);
    }

    return [script, target];
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