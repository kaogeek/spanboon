/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import moment from 'moment';

export class FileUtil {
    public static renameFile(): any {
        return Math.random().toString(36).substring(2, 15) + moment().format('x') + Math.random().toString(36).substring(2, 15);
    }
}
