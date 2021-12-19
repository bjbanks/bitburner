/* Author: Bryson J. Banks */

// globals (affect all script instances)
let debug;

export async function main(ns) {
    // parse args
    let parsed = parseArgs(ns);
    if (parsed.length == 0) return 1;
    let target = parsed[0];

    // is target valid?
    if (!isTargetValid(ns, target)) return 1;

    // use scripts to open vulnerable ports
    openAllPorts(ns, target);

    // use nuke to gain root access
    if (!gainRootAccess(ns, target)) return 1;

    while(true) {
        // if target sec level too high, then weaken
        if (ns.getServerSecurityLevel(target) > calcSecurityThreshold(ns, target)) {
            if (debug) ns.tprint("..weakening target");
            await ns.weaken(target);
        }
        // else if target money too low, then grow
        else if (ns.getServerMoneyAvailable(target) < calcMoneyThreshold(ns, target)) {
            if (debug) ns.tprint("..growing target");
            await ns.grow(target);
        }
        // else, proceed with hack
        else {
            if (debug) ns.tprint("..hacking target");
            await ns.hack(target);
        }
    }
}

// gain root access if not already gained
function gainRootAccess(ns, target) {
    if (!ns.hasRootAccess(target)) {
        // use nuke to gain root
        if (debug) ns.tprint("..nuking target");
        ns.nuke(target);
    }

    if (!ns.hasRootAccess(target)) {
        // nuke failed
        ns.tprint("Error: nuke failed");
        return false;
    }

    if (debug) ns.tprint("..gained root access");
    return true;
}

// open all possible ports on target
function openAllPorts(ns, target) {
    // SSH
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
        if (debug) ns.tprint("..SSH open");
    }

    // FTP
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(target);
        if (debug) ns.tprint("..FTP open");
    }

    // SMTP
    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(target);
        if (debug) ns.tprint("..SMTP open");
    }

    // HTTP
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(target);
        if (debug) ns.tprint("..HTTP open");
    }

    // SQL
    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(target);
        if (debug) ns.tprint("..SQL open");
    }
}

// calculate the money threshold value required to grow
function calcMoneyThreshold(ns, target, modifier = 0.70) {
    let maxMoney = ns.getServerMaxMoney(target);
    let moneyThresh = maxMoney * modifier;

    if (debug) {
        ns.tprint("..moneyThreshModifier = " + modifier);
        ns.tprint("..maxMoney = " + maxMoney);
        ns.tprint("..moneyThresh = " + moneyThresh);
    }

    return moneyThresh;
}

// calculate the security threshold value required to weaken
function calcSecurityThreshold(ns, target, modifier = 5) {
    let minSecLevel = ns.getServerMinSecurityLevel(target)
    let securityThresh = minSecLevel + modifier;

    if (debug) {
        ns.tprint("..securityThreshModifier = " + modifier);
        ns.tprint("..minSecLevel = " + minSecLevel);
        ns.tprint("..securityThresh = " + securityThresh);
    }

    return securityThresh;
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