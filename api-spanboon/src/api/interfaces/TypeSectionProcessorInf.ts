/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { DataProcessorInf } from './DataProcessorInf';

export interface TypeSectionProcessorInf extends DataProcessorInf {
    process(): Promise<any>;

    getType(): string;

    setType(type: string): void;
}