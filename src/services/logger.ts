import winston, { format } from 'winston';
const { combine, timestamp, prettyPrint } = format;

class Logger {
    private logger = winston.createLogger({
        format: combine(
            timestamp(),
            prettyPrint()
        ),
        transports: [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' }),
        ],
    });

    constructor() {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                level: "debug",
                format: winston.format.simple(),
            }));
        }
    }

    log(level: string, message: string) {
        this.logger.log(level, message);
    }
}

class Singleton {
    private static instance: Logger;

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new Logger();
        }
    }

    getInstance() {
        return Singleton.instance;
    }
}

export default Singleton;