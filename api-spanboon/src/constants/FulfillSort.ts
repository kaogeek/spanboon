/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export enum FULFILL_ORDER_BY {
    LASTEST = 'LASTEST',
    DATE = 'DATE',
    UPDATED_BY_PAGE = 'UPDATED_BY_PAGE',
    UPDATED_BY_USER = 'UPDATED_BY_USER',
    APPROVE_DATE_TIME = 'APPROVE_DATE_TIME'
}

export enum FULFILL_GROUP {
    PAGE = 'PAGE',
    POST = 'POST',
    USER = 'USER',
    NONE = 'NONE'
}