/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export class ResponseUtil {
    public static getSuccessResponseObjective(msg: string, value: any, objective?: any,joinObjective?:any): any {
        if (value !== null || value !== undefined || value !== '') {
            const sucessRes: any = {
                status: 1,
                message: msg,
                data: value,
                joinObjective: objective,
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
    public static getSuccessResponse(msg: any, value: any, countNumber?: any, objective?: any,joinObjective?:any): any {
        if (value !== null || value !== undefined || value !== '') {
            const sucessRes: any = {
                status: 1,
                message: msg,
                data: value,
                count: countNumber,
                notiObjective: objective,
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

    public static getSuccessResponseEditPost(msg: string, value: any, Gallery?: any): any {
        if (value !== null || value !== undefined || value !== '') {
            const sucessRes: any = {
                status: 1,
                message: msg,
                data: value,
                postGallery: Gallery,
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

    public static getErrorResponse(msg: string, err: any, twObj?: any): any {
        if (err !== null || err !== undefined || err !== '') {
            const errorResponse: any = {
                status: 0,
                message: msg,
                error: err,
                data: twObj
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

    public static getErrorResponseApple(msg: string, err: any, twObj?: any): any {
        if (err !== null || err !== undefined || err !== '') {
            const errorResponse: any = {
                status: 3,
                message: msg,
                error: err,
                data: twObj
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
    public static getSuccessResponseAuth(msg: string, value: any, authen: any, pic?: any): any {
        if (value !== null || value !== undefined || value !== '') {
            const sucessRes: any = {
                status: 2,
                message: msg,
                data: value,
                authUser: authen,
                picture: pic,
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
