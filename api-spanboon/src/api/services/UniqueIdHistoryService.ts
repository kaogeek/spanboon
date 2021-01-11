/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UniqueIdHistory } from '../models/UniqueIdHistory';
import { UniqueIdHistoryRepository } from '../repositories/UniqueIdHistoryRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class UniqueIdHistoryService {

    constructor(@OrmRepository() private uniqueIdHistoryRepository: UniqueIdHistoryRepository) { }

    // find page
    public find(findCondition: any): Promise<UniqueIdHistory[]> {
        return this.uniqueIdHistoryRepository.find(findCondition);
    }

    // find page
    public findOne(findCondition: any): Promise<UniqueIdHistory> {
        return this.uniqueIdHistoryRepository.findOne(findCondition);
    }

    // find page
    public aggregate(query: any, options?: any): Promise<UniqueIdHistory[]> {
        return this.uniqueIdHistoryRepository.aggregate(query, options).toArray();
    }

    // create page
    public async create(page: UniqueIdHistory): Promise<UniqueIdHistory> {
        return await this.uniqueIdHistoryRepository.save(page);
    }

    // update page
    public async update(query: any, newValue: any): Promise<any> {
        return await this.uniqueIdHistoryRepository.updateOne(query, newValue);
    }

    // delete page
    public async delete(query: any, options?: any): Promise<any> {
        return await this.uniqueIdHistoryRepository.deleteOne(query, options);
    }

    // Search UniqueIdHistory
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.uniqueIdHistoryRepository.count(filter.whereConditions);
        } else {
            return this.uniqueIdHistoryRepository.find(condition);
        }
    }
}
