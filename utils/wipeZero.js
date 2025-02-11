export default function wipeZero(num, digits = 0) {
    const factor = 10 ** digits;
    return Math.floor(num / factor) * factor;
}