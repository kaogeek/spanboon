/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserProvideItems } from '../models/UserProvideItems';
import { UserProvideItemsRepository } from '../repositories/UserProvideItemsRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class UserProvideItemsService {

    constructor(@OrmRepository() private userProvideItemsRepository: UserProvideItemsRepository) { }

    // find userProvideItems
    public find(findCondition: any): Promise<any> {
        return this.userProvideItemsRepository.find(findCondition);
    }

    // find userProvideItems
    public findOne(findCondition: any): Promise<any> {
        return this.userProvideItemsRepository.findOne(findCondition);
    }

    // create userProvideItems
    public async create(userProvideItems: UserProvideItems): Promise<UserProvideItems> {
        return await this.userProvideItemsRepository.save(userProvideItems);
    }

    // update userProvideItems
    public async update(query: any, newValue: any): Promise<any> {
        return await this.userProvideItemsRepository.updateOne(query, newValue);
    }

    // update userProvideItems
    public async updateMany(query: any, newValue: any): Promise<any> {
        return await this.userProvideItemsRepository.updateMany(query, newValue);
    }

    // delete userProvideItems
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userProvideItemsRepository.deleteOne(query, options);
    }

    // find userProvideItems
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.userProvideItemsRepository.aggregate(query, options).toArray();
    }

    // Search UserProvideItems
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.userProvideItemsRepository.count(condition);
        } else {
            return this.userProvideItemsRepository.find(condition);
        }
    }
}
