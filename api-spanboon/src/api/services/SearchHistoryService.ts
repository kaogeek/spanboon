/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchHistory } from '../models/SearchHistory';
import { SearchHistoryRepository } from '../repositories/SearchHistoryRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class SearchHistoryService {

    constructor(@OrmRepository() private searchHistoryRepository: SearchHistoryRepository) { }

    // find SearchHistory
    public async find(findCondition: any): Promise<SearchHistory[]> {
        return await this.searchHistoryRepository.find(findCondition);
    }

    // find SearchHistory
    public async findOne(findCondition: any): Promise<SearchHistory> {
        return await this.searchHistoryRepository.findOne(findCondition);
    }

    // create SearchHistory
    public async create(searchHistory: SearchHistory): Promise<SearchHistory> {
        return await this.searchHistoryRepository.save(searchHistory);
    }

    // update SearchHistory
    public update(query: any, newValue: any): Promise<any> {
        return this.searchHistoryRepository.updateOne(query, newValue);
    }

    // delete SearchHistory
    public async delete(query: any, options?: any): Promise<any> {
        return await this.searchHistoryRepository.deleteOne(query, options);
    }

    // delete SearchHistory
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.searchHistoryRepository.deleteMany(query, options);
    }

    // aggregate SearchHistory
    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.searchHistoryRepository.aggregate(query, options).toArray();
    }

    // aggregate SearchHistory
    public async aggregateEntity(query: any, options?: any): Promise<any[]> {
        return await this.searchHistoryRepository.aggregateEntity(query, options).toArray();
    }

    // select distinct SearchHistory
    public async distinct(key: any, query: any, options?: any): Promise<any> {
        return await this.searchHistoryRepository.distinct(key, query, options);
    }

    // Search SearchHistory
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.searchHistoryRepository.count();
        } else {
            return this.searchHistoryRepository.find(condition);
        }
    }
}
