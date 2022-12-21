/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export class ResponseUtil {
    public static getSuccessResponse(msg: string, value: any): any {
        if (value !== null || value !== undefined || value !== '') {
            const sucessRes: any = {
                status: 1,
                message: msg,
                data: value,
            };
            return sucessRes;
        } else {
            const sucessRes: any = {
                status: 1,
                message: msg,
            };
            return sucessRes;
        }

    }
    public static getErrorResponse(msg: string, err: any): any {
        if (err !== null || err !== undefined || err !== '') {
            const errorResponse: any = {
                status: 0,
                message: msg,
                error: err,
            };
            return errorResponse;
        } else {
            const errorResponse: any = {
                status: 0,
                message: msg,
            };
            return errorResponse;
        }
    }

    public static getSuccessResponseAuth(msg: string, value: any, authen: any, picture?:any): any {
        if (value !== null || value !== undefined || value !== '' && authen === undefined && authen !== null || authen !== undefined) {
            const sucessRes: any = {
                status: 2,
                message: msg,
                data: value,
                authUser: authen,
                pic:picture
            };
            return sucessRes;
        }
        else {
            const sucessRes: any = {
                status: 1,
                message: msg,
            };
            return sucessRes;
        }

    }
    public static getSuccessAuth(msg: string, value: any, data?: any): any {
        if (value !== null || value !== undefined || value !== '') {
            const sucessRes: any = {
                status: 2,
                message: msg,
                data: value,
                result: data,

            };
            return sucessRes;
        } else {
            const sucessRes: any = {
                status: 2,
                message: msg,
            };
            return sucessRes;
        }

    }
    public static getSuccessOTP(msg: string, value: any, data?: any): any {
        if (value !== null || value !== undefined || value !== '') {
            const sucessRes: any = {
                status: 1,
                message: msg,
                data: value,
                limit: data,

            };
            return sucessRes;
        } else {
            const sucessRes: any = {
                status: 1,
                message: msg,
            };
            return sucessRes;
        }

    }
}
