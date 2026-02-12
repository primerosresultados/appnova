export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

export function getContrastColor(hexColor: string): string {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return "#ffffff";

    // Calculate luminance
    // Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

    // Use black for light backgrounds, white for dark
    return luminance > 0.6 ? "#0f172a" : "#ffffff"; // Using slate-900 for black text
}

export function adjustColorBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;

    return (
        "#" +
        (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
            (G < 255 ? (G < 1 ? 0 : G) : 255)
        )
            .toString(16)
            .slice(1)
    );
}

// Convert Hex to HSL string "h s% l%"
export function hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;

    let h = 0, s = 0, l = 0;

    if (delta === 0)
        h = 0;
    else if (cmax === r)
        h = ((g - b) / delta) % 6;
    else if (cmax === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}
