import {createLogger, format, transports} from "winston";

const {combine, timestamp, printf, prettyPrint} = format;

const myFormat = printf(({level, message, label, timestamp}: any) => {
    return `[${timestamp}] ${level}: ${JSON.stringify(message)}`;
});


const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports: [
        new transports.Console({level: "silly"}),
        new transports.File({filename: "./logs/combined.log"}),
        new transports.File({filename: "./logs/error.log", level: "error"}),
    ],
    format: combine(
        format.splat(),
        format.simple(),
        format.prettyPrint(),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        myFormat
    ),
});

export default logger;