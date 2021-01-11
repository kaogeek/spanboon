/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { CustomItem } from '../models/CustomItem';
import { CustomItemRepository } from '../repositories/CustomItemRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class CustomItemService {

    constructor(@OrmRepository() private customItemRepository: CustomItemRepository) { }

    // find CustomItem
    public find(findCondition: any): Promise<CustomItem[]> {
        return this.customItemRepository.find(findCondition);
    }

    // find CustomItem
    public findOne(findCondition: any): Promise<any> {
        return this.customItemRepository.findOne(findCondition);
    }

    // find CustomItem
    public aggregate(query: any, options?: any): Promise<any> {
        return this.customItemRepository.aggregate(query, options).toArray();
    }

    // create CustomItem
    public async create(customItem: CustomItem): Promise<CustomItem> {
        return await this.customItemRepository.save(customItem);
    }

    // update CustomItem
    public async update(query: any, newValue: any): Promise<any> {
        return await this.customItemRepository.updateOne(query, newValue);
    }

    // update CustomItem
    public async updateMany(query: any, newValue: any, options?: any): Promise<any> {
        return await this.customItemRepository.updateMany(query, newValue, options);
    }

    // delete CustomItem
    public async delete(query: any, options?: any): Promise<any> {
        return await this.customItemRepository.deleteOne(query, options);
    }

    // Search CustomItem
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.customItemRepository.count(condition);
        } else {
            return this.customItemRepository.find(condition);
        }
    }
}
