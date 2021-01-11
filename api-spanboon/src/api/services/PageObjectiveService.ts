/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageObjective } from '../models/PageObjective';
import { PageObjectiveRepository } from '../repositories/PageObjectiveRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class PageObjectiveService {

    constructor(@OrmRepository() private pageObjectiveRepository: PageObjectiveRepository) { }

    // find PageObjective
    public find(findCondition?: any): Promise<any[]> {
        return this.pageObjectiveRepository.find(findCondition);
    }

    // find PageObjective
    public findOne(findCondition: any): Promise<any> {
        return this.pageObjectiveRepository.findOne(findCondition);
    }

    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.pageObjectiveRepository.aggregate(query, options).toArray();
    }

    // create PageObjective
    public async create(objective: PageObjective): Promise<PageObjective> {
        return await this.pageObjectiveRepository.save(objective);
    }

    // update PageObjective
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageObjectiveRepository.updateOne(query, newValue);
    }

    // delete PageObjective
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageObjectiveRepository.deleteOne(query, options);
    }

    // Search PageObjective
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageObjectiveRepository.count();
        } else {
            return this.pageObjectiveRepository.find(condition);
        }
    }
}
