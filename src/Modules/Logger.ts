import chalk from "chalk";

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



export default {
    info(message: string) {
        console.log(`${chalk.gray(getDate())}\t${chalk.blue.bold('INFO')}\t${message}`);
    },
    warn(message: string) {
        console.log(`${chalk.gray(getDate())}\t${chalk.yellow.bold('WARN')}\t${message}`);
    },
    error(message: string) {
        console.log(`${chalk.gray(getDate())}\t${chalk.red.bold('ERROR')}\t${message}`);
    },
    debug(message: string) {
        console.log(`${chalk.gray(getDate())}\t${chalk.magenta.bold('DEBUG')}\t${message}`);
    },
    success(message: string) {
        console.log(`${chalk.gray(getDate())}\t${chalk.green.bold('SUCCESS')}\t${message}`);
    },
    fatal(message: string) {
        console.log(`${chalk.gray(getDate())}\t${chalk.bgRed.white.bold('FATAL')}\t${message}`);
    }
}