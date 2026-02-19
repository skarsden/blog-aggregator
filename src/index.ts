import { setUser, readConfig } from "./config.js";
import { CommandRegistry, registerCommand, handlerLogin, runCommand } from "./commands/commandHandler.js";
import { argv, exit } from "process";

async function main() {
    const registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);

    const args = argv.slice(2);
    if (args.length === 0) {
        console.log("Not enough arguments");
        exit(1);
    };

    const command = args[0];
    const cmdArgs = args.slice(1);
    await runCommand(registry, command, ...cmdArgs);
    process.exit(0);
}

main();