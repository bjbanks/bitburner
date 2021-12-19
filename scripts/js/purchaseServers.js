/* Author: Bryson J. Banks */

// globals (affect all script instances)
let debug;

export async function main(ns) {
    // parse args
    let parsed = parseArgs(ns);
    if (parsed.length == 0) return 1;
    let ramSize = parsed[0];
    let forceDestroy = parsed[1];

    // is ram size valid?
    if (!isRAMSizeValid(ns, ramSize)) return 1;

    let i = 0;
    let printFlag = true;
    while (i < ns.getPurchasedServerLimit()) {

        let hostname = "pserv-" + i;
        var money = ns.getServerMoneyAvailable("home");
        var serverCost = ns.getPurchasedServerCost(ramSize);

        if (debug && printFlag) {
            ns.tprint("..server = " + hostname);
            ns.tprint("..cost = " + serverCost);
            printFlag = false;
        }
    
        // check if server already exists
        if (ns.serverExists(hostname)) {
            var servRam = ns.getServerMaxRam(hostname);
    
            if (debug) {
                ns.tprint("..server already exists");
                ns.tprint("..current ram = " + servRam);
            }
            
            // check if correct RAM size
            if (forceDestroy && servRam != ramSize) {
                if (debug) ns.tprint("..destroying server");
                ns.killall(hostname);
                ns.deleteServer(hostname);
            }
            else {
                if (debug) ns.tprint("..skipping server");
                i++;
                printFlag = true;
                continue;
            }
        }
    
        // can we afford server
        if (money > serverCost) {
            if (debug) ns.tprint("..purchasing " + hostname);
            ns.purchaseServer(hostname, ramSize);
            i++;
            printFlag = true;
        }
        else {
            if (debug) ns.tprint("..not enough money: money = " + money + ", cost = " + serverCost);
            await ns.sleep (10000);  // 10 second
        }

    }
}

// parse script arguments
function parseArgs(ns) {
    // check num args
    if (ns.args.length < 2) {
        ns.tprint("Error: missing arg.");
        return [];
    }

    // arg[0] is ramSize (required)
    let ramSize = ns.args[0];

    // arg[1] is forceDestroy (required)
    let forceDestroy = ns.args[1];

    // arg[2] is flag to turn on debug messages
    debug = (ns.args.length > 2 && ns.args[2]) ? true : false;

    if (debug) {
        ns.tprint("..ramSize = " + ramSize);
        ns.tprint("..forceDestroy = " + forceDestroy);
        ns.tprint("..debug = " + debug);
    }

    return [ramSize, forceDestroy];
}

// is RAM size valid?
function isRAMSizeValid(ns, size) {
    // must be power of 2 and less than max size
    if (isPowerOf2(size) && size <= ns.getPurchasedServerMaxRam()) {
        return true;
    }

    ns.tprint("Error: RAM size is not valid.");
    return false;
}

// is n a power of 2?
function isPowerOf2(n) {
    return ((n != 0) && !(n & (n - 1)));
}