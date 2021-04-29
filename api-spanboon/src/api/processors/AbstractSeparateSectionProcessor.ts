/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { SeparateSectionProcessorInf } from '../interfaces/SeparateSectionProcessorInf';
import { SectionModel } from '../models/SectionModel';

export abstract class AbstractSeparateSectionProcessor implements SeparateSectionProcessorInf {

    protected data: any;
    protected config: any;
    protected type: string;

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

    public getType(): string {
        return this.type;
    }

    public setType(type: string): void {
        this.type = type;
    }
}