/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageAbout } from '../models/PageAbout';
import { PageAboutRepository } from '../repositories/PageAboutRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class PageAboutService {

    constructor(@OrmRepository() private pageAboutRepository: PageAboutRepository) { }

    // find PageAbout
    public find(findCondition: any): Promise<PageAbout[]> {
        return this.pageAboutRepository.find(findCondition);
    }

    // find PageAbout
    public findOne(findCondition: any): Promise<PageAbout> {
        return this.pageAboutRepository.findOne(findCondition);
    }

    // find PageAbout
    public aggregate(query: any, options?: any): Promise<PageAbout[]> {
        return this.pageAboutRepository.aggregate(query, options).toArray();
    }

    // create PageAbout
    public async create(pageAbout: PageAbout): Promise<PageAbout> {
        return await this.pageAboutRepository.save(pageAbout);
    }

    // update PageAbout
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageAboutRepository.updateOne(query, newValue);
    }

    // delete PageAbout
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageAboutRepository.deleteOne(query, options);
    }

    // deleteMany
    public async deleteMany(query:any,options?:any):Promise<any>{
        return await this.pageAboutRepository.deleteMany(query,options);
    }

    // Search PageAbout
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageAboutRepository.count(filter.whereConditions);
        } else {
            return this.pageAboutRepository.find(condition);
        }
    }
}
