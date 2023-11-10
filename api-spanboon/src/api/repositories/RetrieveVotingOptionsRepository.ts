/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { EntityRepository, MongoRepository } from 'typeorm';
import { RetrieveVotingOptionsModel as RetrieveVotingOptions} from '../models/RetrieveVotingOptionsModel';

@EntityRepository(RetrieveVotingOptions)
export class RetrieveVotingOptionsRepository extends MongoRepository<RetrieveVotingOptions>  {

}
