/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageCategory } from '../models/PageCategory';
import { PageCategoryRepository } from '../repositories/PageCategoryRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class PageCategoryService {

    constructor(@OrmRepository() private pageCategoryRepository: PageCategoryRepository) { }

    // find PageCategory
    public find(findCondition: any): Promise<any> {
        return this.pageCategoryRepository.find(findCondition);
    }

    // find PageCategory
    public findOne(findCondition: any): Promise<any> {
        return this.pageCategoryRepository.findOne(findCondition);
    }

    // create PageCategory
    public async create(pageCategory: PageCategory): Promise<PageCategory> {
        return await this.pageCategoryRepository.save(pageCategory);
    }

    // update PageCategory
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageCategoryRepository.updateOne(query, newValue);
    }

    // delete PageCategory
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageCategoryRepository.deleteOne(query, options);
    }

    // Search PageCategory
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageCategoryRepository.count(condition);
        } else {
            return this.pageCategoryRepository.find(condition);
        }
    }
}
