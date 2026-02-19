import { setUser } from "src/config";
import { createUser, getUser, getUsers, resetUsers } from "../lib/db/queries/users.js";
import { readConfig } from "../config.js";

export type CommandRegistry = Record<string, CommandHandler>;

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandRegistry, cmdName:string, ...args: string[]): Promise<void> {
    if (!registry[cmdName]) {
        throw new Error(`Command ${cmdName} does not exist`);
    }
    await registry[cmdName](cmdName, ...args);
}


//Command definitions----------------------------------------------------------
export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <name>`);
    }
    
    const name = args[0];
    if (await getUser(name) === undefined) {
        throw new Error(`User ${name} not found`);
    }
    setUser(name);
    console.log(`User '${name} has been set`);
};

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(`Usage: ${cmdName} <name>`);
    }
    const name = args[0];
    const user = await createUser(name);
    if (!user) {
        throw new Error(`User ${name} not found`);
    }

    setUser(user.name);
    console.log(`User ${user.name} created successfully`);
}

export async function handlerReset() {
    await resetUsers();
}

export async function handlerGetUsers() {
    const config = readConfig();
    const users = await getUsers();
    for (const u of users) {
        if (u.name === config.currentUserName) {
            console.log(`* ${u.name} (current)`);
            continue;
        }
        console.log(`* ${u.name}`);
    }
}