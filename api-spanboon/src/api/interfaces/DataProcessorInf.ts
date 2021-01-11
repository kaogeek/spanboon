/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export interface DataProcessorInf {
    getData(): any;
    setData(data: any): void;
    getConfig(): any;
    setConfig(config: any): void;
    process(): Promise<any>;
}