/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export class InputFormatterUtils {
    public static formatCurrencyNumber(value: number, minFraction?: number, maxFraction?: number): string {
        const minFrag = (minFraction !== undefined && minFraction !== null) ? minFraction : 0;
        const maxFrag = (maxFraction !== undefined && maxFraction !== null) ? maxFraction : 0;

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            // These options are needed to round to whole numbers if that's what you want.
            minimumFractionDigits: minFrag, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
            maximumFractionDigits: maxFrag, // (causes 2500.99 to be printed as $2,501)
        });

        let result = formatter.format(value);
        result = result.replace('$', '');

        return result;
    }
}