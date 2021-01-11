/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { ObjectID } from 'mongodb';
import { SectionModelResponse } from './SectionModelResponse';

export class MainPageModelResponse {

    public id: ObjectID;
    public emergencyEvents: SectionModelResponse[];
    public emergencyPin: SectionModelResponse;
    public lastest: SectionModelResponse;
    public hots: SectionModelResponse[];
    public viewSection: SectionModelResponse;
    public sectionModel: SectionModelResponse;
}