/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserLike } from '../models/UserLike';
import { UserLikeRepository } from '../repositories/UserLikeRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class UserLikeService {

    constructor(@OrmRepository() private userLikeRepository: UserLikeRepository) { }

    // find userLike
    public async find(findCondition: any): Promise<UserLike[]> {
        return await this.userLikeRepository.find(findCondition);
    }

    // find userLike
    public findOne(findCondition: any): Promise<UserLike> {
        return this.userLikeRepository.findOne(findCondition);
    }

    // create userLike
    public async create(userLike: UserLike): Promise<UserLike> {
        return await this.userLikeRepository.save(userLike);
    }

    // update userLike
    public async update(query: any, newValue: any): Promise<any> {
        return await this.userLikeRepository.updateOne(query, newValue);
    }

    // delete userLike
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userLikeRepository.deleteOne(query, options);
    }

    // aggregate userLike
    public aggregate(query: any, options?: any): Promise<UserLike[]> {
        return this.userLikeRepository.aggregate(query, options).toArray();
    }

    // Search UserLike
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.userLikeRepository.count(condition);
        } else {
            return this.userLikeRepository.find(condition);
        }
    }
}
