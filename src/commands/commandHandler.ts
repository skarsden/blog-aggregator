import { setUser } from "src/config";

export type CommandRegistry = Record<string, CommandHandler>;

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("Not enough arguments");
    }
    const username = args[0];
    setUser(username);
    console.log(`User '${username} has been set`);
};

export function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandRegistry, cmdName:string, ...args: string[]) {
    if (!registry[cmdName]) {
        throw new Error(`Command ${cmdName} does not exist`);
    }
    registry[cmdName](cmdName, ...args);
}