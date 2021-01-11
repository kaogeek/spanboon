/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export enum CHAT_MESSAGE_TYPE {
    INFO = 'INFO',
    FULFILLMENT_REQUEST_CREATE = 'FULFILLMENT_REQUEST_CREATE',
    FULFILLMENT_REQUEST_EDIT = 'FULFILLMENT_REQUEST_EDIT',
    FULFILLMENT_REQUEST_DELETE = 'FULFILLMENT_REQUEST_DELETE',
    FULFILLMENT_CASE_CREATE = 'FULFILLMENT_CASE_CREATE',
    FULFILLMENT_CASE_CONFIRM = 'FULFILLMENT_CASE_CONFIRM',
    FULFILLMENT_CASE_CANCEL = 'FULFILLMENT_CASE_CANCEL',
}