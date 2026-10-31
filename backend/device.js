// Short "Browser on OS" label from a User-Agent string, for the admin panel
// and recent-logins.js. The raw string is what gets stored; this is display
// only, so a rough match is fine.
function describeDevice(userAgent) {
    const ua = String(userAgent || '');
    if (!ua) return '';

    const os =
        /iPhone|iPad|iPod/.test(ua) ? 'iOS' :
        /Android/.test(ua) ? 'Android' :
        /Windows/.test(ua) ? 'Windows' :
        /CrOS/.test(ua) ? 'ChromeOS' :
        /Mac OS X|Macintosh/.test(ua) ? 'macOS' :
        /Linux/.test(ua) ? 'Linux' :
        'unknown OS';

    // Order matters: Edge, Opera and Samsung all also say "Chrome", and
    // Chrome also says "Safari".
    const browser =
        /Edg(e|A|iOS)?\//.test(ua) ? 'Edge' :
        /OPR\/|Opera/.test(ua) ? 'Opera' :
        /SamsungBrowser/.test(ua) ? 'Samsung Internet' :
        /Firefox\/|FxiOS/.test(ua) ? 'Firefox' :
        /Chrome\/|CriOS/.test(ua) ? 'Chrome' :
        /Safari\//.test(ua) ? 'Safari' :
        /curl|wget|python|node|axios|postman/i.test(ua) ? 'Script/tool' :
        'unknown browser';

    return `${browser} on ${os}`;
}

module.exports = { describeDevice };
