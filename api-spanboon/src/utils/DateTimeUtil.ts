/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import moment from 'moment';

export class DateTimeUtil {

    public static generateCurrentMonthRanges(): Date[] {
        const result = [];
        const startOfMonth = moment().clone().startOf('month').toDate();
        const endOfMonth = moment().clone().endOf('month').toDate();
        const datetimeRange = [startOfMonth, endOfMonth];

        result.push(datetimeRange);
        return result;
    }

    public static generatePreviousDaysPeriods(endDate: Date, days: number): Date[] {
        const result = [];
        if (endDate === undefined || endDate === null) {
            return result;
        }

        if (days < 0) {
            return result;
        }

        const subtractDay = (days !== undefined && days > 0) ? days - 1 : 0;

        const startDateRange = moment(endDate).clone().utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(subtractDay, 'days').toDate();
        const endDateRange = moment(endDate).clone().utcOffset(0).set({ hour: 24, minute: 0, second: 0, millisecond: 0 }).toDate();

        result.push(DateTimeUtil.parseISOStringToDate(startDateRange.toISOString()));
        result.push(DateTimeUtil.parseISOStringToDate(endDateRange.toISOString()));

        return result;
    }

    public static parseISOStringToDate(isoDateString: string): Date {
        const split: any = isoDateString.split(/\D+/);
        return new Date(split[0], --split[1], split[2], split[3], split[4], split[5], split[6]);
    }

    public static getDateString(date: Date): string {
        const yesDd = date.getDate();
        const yesMm = date.getMonth() + 1;
        const yesYyyy = date.getFullYear();
        const yesHours = date.getHours();
        const yesMinutes = date.getMinutes();
        const yesSeconds = date.getSeconds();

        let yesDdString = yesDd + '';
        if (yesDd < 10) {
            yesDdString = '0' + yesDd;
        }

        let yesMmString = yesMm + '';
        if (yesMm < 10) {
            yesMmString = '0' + yesMm;
        }

        let yesHoursString = +yesHours + '';
        if (yesHours < 10) {
            yesHoursString = '0' + yesHours;
        }

        let yesMinutesString = +yesMinutes + '';
        if (yesMinutes < 10) {
            yesMinutesString = '0' + yesMinutes;
        }

        let yesSecondsString = yesSeconds + '';
        if (yesSeconds < 10) {
            yesSecondsString = '0' + yesSeconds;
        }

        const dayStr = yesYyyy + '-' + yesMmString + '-' + yesDdString + ' ' + yesHoursString + ':' + yesMinutesString + ':' + yesSecondsString;
        return dayStr;
    }
}