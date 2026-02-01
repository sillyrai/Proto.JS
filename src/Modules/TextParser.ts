export default {
    TimeStringParser: (timeString: string): number | null => {
        const timeUnits: { [key: string]: number } = {
            s: 1000,                // seconds
            m: 60 * 1000,           // minutes
            h: 60 * 60 * 1000,      // hours
            d: 24 * 60 * 60 * 1000  // days
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
    }
}