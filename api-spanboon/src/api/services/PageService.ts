/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Page } from '../models/Page';
import { PageRepository } from '../repositories/PageRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class PageService {

    constructor(@OrmRepository() private pageRepository: PageRepository) { }

    // find page
    public find(findCondition: any): Promise<Page[]> {
        return this.pageRepository.find(findCondition);
    }

    // find page
    public findOne(findCondition: any): Promise<Page> {
        return this.pageRepository.findOne(findCondition);
    }

    // find page
    public aggregate(query: any, options?: any): Promise<Page[]> {
        return this.pageRepository.aggregate(query, options).toArray();
    }

    // create page
    public async create(page: Page): Promise<Page> {
        return await this.pageRepository.save(page);
    }

    // update page
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageRepository.updateOne(query, newValue);
    }

    // delete page
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageRepository.deleteOne(query, options);
    }

    // Search Page
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageRepository.count(filter.whereConditions);
        } else {
            return this.pageRepository.find(condition);
        }
    }
}
