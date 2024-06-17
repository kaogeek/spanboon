/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { EntityRepository, MongoRepository } from 'typeorm';
import { MfpAct } from '../models/MfpActModel';

@EntityRepository(MfpAct)
export class MfpActRepository extends MongoRepository<MfpAct>  {

}
