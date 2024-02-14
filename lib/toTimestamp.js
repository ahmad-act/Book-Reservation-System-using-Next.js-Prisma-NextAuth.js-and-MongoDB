function toTimezone(tz, date = new Date()) {
    // Get parts except timezone name
    let opts = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: tz,
        timeZoneName: 'shortOffset',
        hour12: false
    }
    // To get full timezone name
    let opts2 = {
        hour: 'numeric',
        timeZone: tz,
        timeZoneName: 'long'
    }
    let toParts = opts => new Intl.DateTimeFormat('en', opts)
        .formatToParts(date)
        .reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, Object.create(null));

    let { year, month, day, weekday, hour, minute,
        second, timeZoneName } = toParts(opts);
    // Fix offset
    let sign = /\+/.test(timeZoneName) ? '+' : '-';
    let [oH, oM] = timeZoneName.substr(4).split(':');
    let offset = `GMT${sign}${oH.padStart(2, '0')}${oM || '00'}`;
    // Get timezone name
    timeZoneName = toParts(opts2).timeZoneName;

    return `${weekday} ${month} ${day} ${year} ${hour}:${minute}:${second} ${offset} (${timeZoneName})`;
}

function toTimestampLog(tz, date = new Date()) {
    // Get parts except timezone name
    let opts = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: tz,
        timeZoneName: 'shortOffset',
        hour12: false
    }
    // To get full timezone name
    let opts2 = {
        hour: 'numeric',
        timeZone: tz,
        timeZoneName: 'long'
    }
    let toParts = opts => new Intl.DateTimeFormat('en', opts)
        .formatToParts(date)
        .reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, Object.create(null));

    let { year, month, day, weekday, hour, minute,
        second, timeZoneName } = toParts(opts);
    // Fix offset
    let sign = /\+/.test(timeZoneName) ? '+' : '-';
    let [oH, oM] = timeZoneName.substr(4).split(':');
    let offset = `GMT${sign}${oH.padStart(2, '0')}${oM || '00'}`;
    // Get timezone name
    timeZoneName = toParts(opts2).timeZoneName;

    return `${year}-${month}-${day} ${hour}:${minute}:${second} ${offset}`;
}

module.exports = {
    toTimezone,
    toTimestampLog
}