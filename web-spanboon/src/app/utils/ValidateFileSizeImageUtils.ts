/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { MAX_FILE_SIZE } from "../Config";

export class ValidateFileSizeImageUtils {

    public static sizeImage(imageSize: number) { 
        if (imageSize > MAX_FILE_SIZE) {
            return true;
        } else {
            return false;
        }
    }
}