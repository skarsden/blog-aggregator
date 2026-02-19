import path from "node:path";
import os from "node:os";
import { readFileSync, writeFileSync } from "node:fs";

type Config = {
    dbUrl: string;
    currentUserName: string;
}

export function setUser(username: string) {
    const config: Config = readConfig();
    config.currentUserName = username;
    const rawConfig = { db_url: config.dbUrl, current_user_name: config.currentUserName}
    writeFileSync(getConfigFilepath(), JSON.stringify(rawConfig, null, 2), { encoding: 'utf-8'});
}

export function readConfig() {
    const data = readFileSync(getConfigFilepath(), { encoding: 'utf-8' });
    const rawConfig = JSON.parse(data);
    return validateConfig(rawConfig);
}

function getConfigFilepath() {
    return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(rawConfig: any) {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("db_url is required in config file");
    }
    if (!rawConfig.current_user_name || typeof rawConfig.current_user_name !== "string") {
        throw new Error("current_user_name is required in config file");
    }

    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name
    };

    return config;
}