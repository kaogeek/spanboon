/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { EntityRepository, MongoRepository } from 'typeorm';
import { UserHiddenContent } from '../models/UserHiddenContent';

@EntityRepository(UserHiddenContent)
export class UserHiddenContentRepository extends MongoRepository<UserHiddenContent>  {

}
