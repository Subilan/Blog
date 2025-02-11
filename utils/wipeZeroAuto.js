export default function wipeZeroAuto(num) {
    const numberLength = num.toString().length;

    if (numberLength <= 2) return num;

    if (numberLength === 3) return wipeZero(num, 2);

    return wipeZero(num, numberLength - 2);
}