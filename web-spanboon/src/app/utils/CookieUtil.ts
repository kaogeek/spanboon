/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

export class CookieUtil {
    public static setCookie(name: string, val: string) {
        const date = new Date();
        const value = val;

        // Set it expire in 7 days
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

        // Set it
        document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
    }

    public static getCookie(name: string) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        
        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }

    public static deleteCookie(name: string) {
        const date = new Date();

        // Set it expire in -1 days
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

        // Set it
        document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
    }
}