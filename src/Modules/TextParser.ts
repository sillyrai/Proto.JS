export default {
    TimeStringParser: (timeString: string): number | null => {
        const timeUnits: { [key: string]: number } = {
            s: 1000,                 // seconds
            m: 60 * 1000,            // minutes
            h: 60 * 60 * 1000,       // hours
            d: 24 * 60 * 60 * 1000   // days
        };

        const regex = /(\d+)([smhd])/g;
        let match;
        let totalMilliseconds = 0;
        let found = false;

        while ((match = regex.exec(timeString)) !== null) {
            found = true;
            const value = parseInt(match[1], 10);
            const unit = match[2];
            if (timeUnits[unit]) {
                totalMilliseconds += value * timeUnits[unit];
            }
        }

        return found ? totalMilliseconds : null;
    },

    // prefix \ to every character
    EscapeSymbols: (input: string): string => {
        return input.replace(/([_*~`|[\]()<>#+\-=.!])/g, '\\$1');
    },

    /*
    Compare two bigints and give a nice looking diff calculation,
    for example:
    a: 1000n
    b: 1500n
    returns:
```diff
1000
+ 500
= 1500
```
    */
    NumDiffBigInt(a: string, b: string): string {
        const bigA = BigInt(a);
        const bigB = BigInt(b);
        const diff = bigB - bigA;
        const sign = diff >= 0 ? "+" : "-";
        const absDiff = diff >= 0 ? diff : -diff;
        return `\`\`\`diff
${this.BigIntComma(bigA)}
${sign} ${this.BigIntComma(absDiff)}
= ${this.BigIntComma(bigB)}
\`\`\``;
    },

    BigIntComma(num: string|bigint): string {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Input 20k -> Output 20000n
    SuffixNumber(num: string): bigint|null {
        const suffixes: { [key: string]: bigint } = {
            k: 1000n,
            m: 1000000n,
            b: 1000000000n,
            t: 1000000000000n
        };

        const regex = /^(\d+(?:\.\d+)?)([kmbt])?$/i;
        const match = num.match(regex);
        if (!match) return null;

        const valueStr = match[1];
        const suffix = match[2]?.toLowerCase();

        if (suffix && suffixes[suffix]) {
            const factor = suffixes[suffix];
            return BigInt(Math.floor(parseFloat(valueStr) * Number(factor)));
        } else {
            return BigInt(Math.floor(parseFloat(valueStr)));
        }
    },

    SizeSuffix(num: bigint): string {
        const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Oc", "No", "De", "Ud", "Dd", "Td", "Qt", "Qi", "Sxt", "Oct", "Not", "Vg", "Uv", "Dv", "Tv", "QtV", "QiV", "SxtV", "OctV", "NotV"];
        let size = num;
        let suffixIndex = 0;
        while (size >= 1000n && suffixIndex < suffixes.length - 1) {
            size /= 1000n;
            suffixIndex++;
        }
        return `${size}${suffixes[suffixIndex]}`;
    },

}