/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

export enum POST_TYPE {
    GENERAL = 'GENERAL',
    FULFILLMENT = 'FULFILLMENT',
    NEEDS = 'NEEDS'
}
export enum SORT_BY {
    LASTEST_DATE = 'LASTEST_DATE',
    POPULAR = 'POPULAR',
    RELATED = 'RELATED'
}

export enum USER_LEVEL {
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
    EDITOR = 'EDITOR',
    MODERATOR = 'MODERATOR',
    POST_MODERATOR = 'POST_MODERATOR',
    FULFILLMENT_MODERATOR = 'FULFILLMENT_MODERATOR',
    CHAT_MODERATOR = 'CHAT_MODERATOR',
}
