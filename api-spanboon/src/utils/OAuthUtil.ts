/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import * as crypto from 'crypto';

export class OAuthUtil {
    public static generateNonce(): any {
        const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
        const result = [];
        crypto.randomBytes(10).toJSON().data.forEach(c =>
            result.push(charset[c % charset.length]));
        return result.join('');
    }
}
