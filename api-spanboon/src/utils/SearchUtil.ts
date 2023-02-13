/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { MAX_SEARCH_ROWS } from '../constants/Constants';

export class SearchUtil {

    // !implement escape
    public static getEscapeString(value: string): string {
        return value;
    }

    /*
     * Create Find Condition 
     * {
     *    select: any[],
     *    relations: any,
     *    join: {},
     *    where: {},
     *    order: {},
     *    skip: number, //offset
     *    take: number // limit
     * }
     */
    public static createFindCondition(limit: any, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, join?: any): any {
        const condition: any = {};
        if (select !== undefined && select.length > 0) {
            condition.select = select;
        }
        
        if (relation !== undefined) {
            condition.relations = relation;
        }

        if(whereConditions !== undefined){
            condition.where = whereConditions;
        }

        if (join) {
            condition.join = join;
        }
        condition.order = orderBy;

        const limits = this.getSearchLimit(limit);
        if (limits && limits > 0) {
            condition.take = limits;
            condition.skip = offset;
        }
        return condition;
    }

    public static getSearchLimit(limit: any): any {
        if (limit <= MAX_SEARCH_ROWS) {
            return limit;
        } else if (limit > MAX_SEARCH_ROWS || limit === undefined) {
            const limits = MAX_SEARCH_ROWS;
            return limits;
        }
    }

    public static getDateTimeString(date: Date): string {
        if (date !== undefined && date !== null) {
            return date.toJSON().slice(0, 19).replace('T', ' ');
        }

        return null;
    }
}
