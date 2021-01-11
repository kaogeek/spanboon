/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { SectionModelProcessorInf } from '../interfaces/SectionModelProcessorInf';
import { SectionModel } from '../models/SectionModel';

export abstract class AbstractSectionModelProcessor implements SectionModelProcessorInf {
    protected data: any;
    protected config: any;

    public abstract process(): Promise<SectionModel>;

    public getData(): any {
        return this.data;
    }

    public setData(data: any): void {
        this.data = data;
    }

    public getConfig(): any {
        return this.config;
    }

    public setConfig(config: any): void {
        this.config = config;
    }
}
