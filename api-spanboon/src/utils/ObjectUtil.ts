/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export class ObjectUtil {

    public static createNewObjectWithField(sourceObject: any, keys?: string[]): any {
        let result = {};

        if (keys !== undefined) {
            for (const key of keys) {
                result[key] = sourceObject[key];
            }
        } else {
            result = JSON.parse(JSON.stringify(sourceObject));
        }

        return result;
    }

    public static isObjectEmpty(obj: any): boolean {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }
}
