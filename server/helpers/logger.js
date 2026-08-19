const service = "memories-api";

function write(level, event, fields = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        service,
        event,
        ...fields,
    };

    const output = JSON.stringify(entry);
    if (level === "error") {
        console.error(output);
    } else {
        console.log(output);
    }
}

const logger = {
    info: (event, fields) => write("info", event, fields),
    warn: (event, fields) => write("warn", event, fields),
    error: (event, fields) => write("error", event, fields),
};

export default logger;