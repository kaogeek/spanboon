/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { StandardItemCategory } from '../models/StandardItemCategory';
import { StandardItemCategoryRepository } from '../repositories/StandardItemCategoryRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class StandardItemCategoryService {

    constructor(@OrmRepository() private standardItemCategoryRepository: StandardItemCategoryRepository) { }

    // find standardItemCategory
    public async find(findCondition: any): Promise<any[]> {
        return await this.standardItemCategoryRepository.find(findCondition);
    }

    // find standardItemCategory
    public findOne(findCondition: any): Promise<any> {
        return this.standardItemCategoryRepository.findOne(findCondition);
    }

    // create standardItemCategory
    public async create(standardItemCategory: StandardItemCategory): Promise<StandardItemCategory> {
        return await this.standardItemCategoryRepository.save(standardItemCategory);
    }

    // update standardItemCategory
    public async update(query: any, newValue: any): Promise<any> {
        return await this.standardItemCategoryRepository.updateOne(query, newValue);
    }

    // delete standardItemCategory
    public async delete(query: any, options?: any): Promise<any> {
        return await this.standardItemCategoryRepository.deleteOne(query, options);
    }

    // find user
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.standardItemCategoryRepository.aggregate(query, options).toArray();
    }

    // Search StandardItemCategory
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.standardItemCategoryRepository.count(condition);
        } else {
            return this.standardItemCategoryRepository.find(condition);
        }
    }
}
