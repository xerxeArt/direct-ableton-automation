export function jiggleAroundPercentage(value: number, amountPercentage: number, onlyDown: boolean = false): number {
    var offset = (Math.random() * 2 - 1) * amountPercentage / 100;
    if (onlyDown) offset = -Math.abs(offset);
    return value + offset;
}
