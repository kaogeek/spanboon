/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

export class Today {
    public id?: any;
    public title: string;
    public type: string;
    public field: string;
    public position: number;
    public buckets: FieldBucket[];
}

export interface FieldBucket {
    value: string;
}