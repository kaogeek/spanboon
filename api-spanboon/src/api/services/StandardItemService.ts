/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { StandardItem } from '../models/StandardItem';
import { StandardItemRepository } from '../repositories/StandardItemRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class StandardItemService {

    constructor(@OrmRepository() private standardItemRepository: StandardItemRepository) { }

    // find standardItem
    public async find(findCondition: any): Promise<any[]> {
        return await this.standardItemRepository.find(findCondition);
    }

    // find standardItem
    public findOne(findCondition: any): Promise<any> {
        return this.standardItemRepository.findOne(findCondition);
    }

    // create standardItem
    public async create(standardItem: StandardItem): Promise<StandardItem> {
        return await this.standardItemRepository.save(standardItem);
    }

    // update standardItem
    public async update(query: any, newValue: any): Promise<any> {
        return await this.standardItemRepository.updateOne(query, newValue);
    }

    // delete standardItem
    public async delete(query: any, options?: any): Promise<any> {
        return await this.standardItemRepository.deleteOne(query, options);
    }

    // find standardItem
    public aggregate(query: any, options?: any): Promise<any> {
        return this.standardItemRepository.aggregate(query, options).toArray();
    }

    // Search StandardItem
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.standardItemRepository.count(condition);
        } else {
            return this.standardItemRepository.find(condition);
        }
    }
}
