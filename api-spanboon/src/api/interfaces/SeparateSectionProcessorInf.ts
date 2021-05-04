/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { DataProcessorInf } from './DataProcessorInf';
import { SectionModel } from '../models/SectionModel';

export interface SeparateSectionProcessorInf extends DataProcessorInf {
    process(): Promise<SectionModel>;

    getType(): string;

    setType(type: string): void;
}