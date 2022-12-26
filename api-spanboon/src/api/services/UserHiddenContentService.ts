/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserHiddenContent } from '../models/UserHiddenContent';
import { UserHiddenContentRepository } from '../repositories/UserHiddenContentRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class UserHiddenContentService {

    constructor(@OrmRepository() private contentHiddenRepository: UserHiddenContentRepository) { }

    // find UserHiddenContent
    public async find(findCondition: any): Promise<UserHiddenContent[]> {
        return this.contentHiddenRepository.find(findCondition);
    }

    // find UserHiddenContent
    public findOne(findCondition: any): Promise<UserHiddenContent> {
        return this.contentHiddenRepository.findOne(findCondition);
    }

    // create UserHiddenContent
    public async create(contentHidden: UserHiddenContent): Promise<UserHiddenContent> {
        return await this.contentHiddenRepository.save(contentHidden);
    }

    // update UserHiddenContent
    public async update(query: any, newValue: any): Promise<any> {
        return await this.contentHiddenRepository.updateOne(query, newValue);
    }

    // delete UserHiddenContent
    public async delete(query: any, options?: any): Promise<any> {
        return await this.contentHiddenRepository.deleteOne(query, options);
    }

    // aggregate UserHiddenContent
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.contentHiddenRepository.aggregate(query, options).toArray();
    }

    // Search UserHiddenContent
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.contentHiddenRepository.count(whereConditions);
        } else {
            return this.contentHiddenRepository.find(condition);
        }
    }
}
