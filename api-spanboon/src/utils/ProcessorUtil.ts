/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { DataProcessorInf } from '../api/interfaces/DataProcessorInf';

export class ProcessorUtil {
    public static randomProcessorOrdering(processor: DataProcessorInf[]): DataProcessorInf[] {
        const result = [];

        if (processor === undefined || processor === null || processor.length <= 0) {
            return result;
        }

        // random processor
        let originalCount = processor.length;
        while (originalCount > 0) {
            const randIdx = Math.floor(Math.random() * processor.length);
            const item = processor[randIdx];
            result.push(item);
            // remove item
            processor.splice(randIdx, 1);
            // update orifinal count
            originalCount = processor.length;
        }

        return result;
    }
}