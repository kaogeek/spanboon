/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { extendMoment } from 'moment-range';
import { unitOfTime } from 'moment';

export class DecayFunctionUtil {
    // m = ความชัน
    public static expoDecay(t: number, m: number): number {
        return Math.pow(m, t);
    }

    public static linearDecay(t: number, m: number): number {
        return 1 - (m * t);
    }

    public static f1Decay(t: number, m: number): number {
        return (1-(Math.pow((1+m),(t-1))));
    }

    public static generateDecayMap(decayType: string, startDate: Date, endDate: Date, dateArray: Date[], unit: unitOfTime.Diff, step: number, m: number): any {
        
        const result: any = {};

        let times: Date[] = this.devideTimespan(startDate, endDate, unit, step);
        times = DecayFunctionUtil.sortDateArray(times, 'DESC');

        for (const date of dateArray) {
            const index = this.getDescendingRangeIndex(date, times);
            
            if (decayType === 'linear') {
                result[date.toISOString()] = this.linearDecay(index, m);
            } else if (decayType === 'expo') {
                result[date.toISOString()] = this.expoDecay(index, m);
            } else if (decayType === 'f1') {
                result[date.toISOString()] = this.f1Decay(index, m);
            }
        }

        return result;
    }

    public static generateExpoDecayMap(startDate: Date, endDate: Date, dateArray: Date[], unit: unitOfTime.Diff, step: number, m: number): any {
        return this.generateDecayMap('expo', startDate, endDate, dateArray, unit, step, m);
    }

    public static generateF1DecayMap(startDate: Date, endDate: Date, dateArray: Date[], unit: unitOfTime.Diff, step: number, m: number): any {
        return this.generateDecayMap('f1', startDate, endDate, dateArray, unit, step, m);
    }

    public static generateLinearDecayMap(startDate: Date, endDate: Date, dateArray: Date[], unit: unitOfTime.Diff, step: number, m: number): any {
        return this.generateDecayMap('linear', startDate, endDate, dateArray, unit, step, m);
    }

    public static sortDateArray(dateArray: Date[], direction: string = 'ASC'): Date[] {
        if (dateArray === undefined || dateArray === null || dateArray.length <= 0) {
            return dateArray;
        }

        if (direction === 'ASC') {
            dateArray.sort((d1: Date, d2: Date) => {
                if (d1.getTime() > d2.getTime()) {
                    return 1;
                } else if (d1.getTime() < d2.getTime()) {
                    return -1;
                }
                return 0;
            });
        } else if (direction === 'DESC') {
            dateArray.sort((d1: Date, d2: Date) => {
                if (d1.getTime() > d2.getTime()) {
                    return -1;
                } else if (d1.getTime() < d2.getTime()) {
                    return 1;
                }

                return 0;
            });
        }

        return dateArray;
    }

    public static getDescendingRangeIndex(date: Date, rangeDateArray: Date[]): number {
        if (date === undefined) {
            return -1;
        }

        if (rangeDateArray === undefined || rangeDateArray.length <= 0) {
            return -1;
        }

        // range must sort from newest to oldest
        const moment = require('moment/moment');
        let resultIndex = -1;
        for (let i = 0; i < rangeDateArray.length; i++) {
            const endDate = rangeDateArray[i];
            let startDate = undefined;

            if ((i + 1) < rangeDateArray.length) {
                startDate = rangeDateArray[i + 1];
            }

            if(endDate !== undefined){
                endDate.setHours(23);
                endDate.setMinutes(59);
                endDate.setSeconds(59);
            }

            if (startDate !== undefined && endDate !== undefined) {
                const range = extendMoment(moment).range(startDate, endDate);
                if (range.contains(date)) {
                    resultIndex = i;
                    break;
                }
            } else {
                // end date is undefine this is the end of range.
                break;
            }
        }

        return resultIndex;
    }

    public static devideTimespan(startDate: Date, endDate: Date, unit: unitOfTime.Diff, step: number = 1): Date[] {
        const moment = require('moment/moment');
        const range = extendMoment(moment).range(startDate, endDate);
        const timeTicks = Array.from(range.by(unit, {
            step
        }));

        const dateArray: Date[] = [];
        for (const item of timeTicks) {
            dateArray.push(item.toDate());
        }

        return dateArray;
    }

    public static getMonthDateRange(): Date[] {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const result = [firstDay, lastDay];

        return result;
    }

    public static getBeforeTodayRange(days: number): Date[] {
        const moment = require('moment/moment');

        const today = moment().utc();
        const lastDay =  today.clone().toDate();
        lastDay.setHours(23);
        lastDay.setMinutes(59);
        lastDay.setSeconds(59);
        const firstDay = today.clone().subtract(days, 'days').toDate();
        firstDay.setHours(0);
        firstDay.setMinutes(0);
        firstDay.setSeconds(0);
        const result = [firstDay, lastDay];

        return result;
    }
}