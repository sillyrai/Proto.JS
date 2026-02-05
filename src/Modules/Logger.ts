import chalk from "chalk";
import { WebhookClient } from "discord.js";
import fs from "fs";

function getDate(): string { // YYYY-MM-DD HH:MM:SS
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function appendToFile(message: string, sendLog: boolean = false) {
    let root = process.cwd();
    let logDir = `${root}/logs`;
    if(!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    // logs named by date (YYYY-MM-DD.txt)
    let logFile = `${logDir}/${getDate().split(' ')[0]}.txt`;
    message = message.replace(/\x1b\[[0-9;]*m/g, ''); // remove ANSI codes
    fs.appendFileSync(logFile, message + '\n');

    if(sendLog) {
        let LogHook = new WebhookClient({url:process.env.LOG_WEBHOOK_URL!});
        LogHook.send({ // no await because we don't care about the result
            content: message
        });
    }
}

export default {
    info(message: string, sendLog: boolean = false) {
        console.log(`${chalk.gray(getDate())}\t${chalk.blue.bold('INFO')}\t${message}`);
        appendToFile(`${getDate()}\tINFO\t${message}`, sendLog);
    },
    warn(message: string, sendLog: boolean = false) {
        console.log(`${chalk.gray(getDate())}\t${chalk.yellow.bold('WARN')}\t${message}`);
        appendToFile(`${getDate()}\tWARN\t${message}`, sendLog);
    },
    error(message: string, sendLog: boolean = false) {
        console.log(`${chalk.gray(getDate())}\t${chalk.red.bold('ERROR')}\t${message}`);
        appendToFile(`${getDate()}\tERROR\t${message}`, sendLog);
    },
    debug(message: string, sendLog: boolean = false) {
        console.log(`${chalk.gray(getDate())}\t${chalk.magenta.bold('DEBUG')}\t${message}`);
        appendToFile(`${getDate()}\tDEBUG\t${message}`, sendLog);
    },
    success(message: string, sendLog: boolean = false) {
        console.log(`${chalk.gray(getDate())}\t${chalk.green.bold('SUCCESS')}\t${message}`);
        appendToFile(`${getDate()}\tSUCCESS\t${message}`, sendLog);
    },
    fatal(message: string, sendLog: boolean = false) {
        console.log(`${chalk.gray(getDate())}\t${chalk.bgRed.white.bold('FATAL')}\t${message}`);
        appendToFile(`${getDate()}\tFATAL\t${message}`, sendLog);
    }
}