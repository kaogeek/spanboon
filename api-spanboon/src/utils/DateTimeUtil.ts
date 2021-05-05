/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import moment from 'moment';

export class DateTimeUtil {

    public static generateCurrentMonthRanges(): any[] {
        const result = [];
        const startOfMonth = moment().clone().startOf('month').toDate();
        const endOfMonth = moment().clone().endOf('month').toDate();
        const datetimeRange = [startOfMonth, endOfMonth];

        result.push(datetimeRange);
        return result;
    }

}