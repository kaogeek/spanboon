/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { HashTag } from '../models/HashTag';
import { HashTagRepository } from '../repositories/HashTagRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class HashTagService {

    constructor(@OrmRepository() private hashTagRepository: HashTagRepository) { }

    // find hashTag
    public findOne(findCondition: any): Promise<any> {
        return this.hashTagRepository.findOne(findCondition);
    }

    // create hashTag
    public async create(hashTag: HashTag): Promise<HashTag> {
        return await this.hashTagRepository.save(hashTag);
    }

    // update hashTag
    public async update(query: any, newValue: any): Promise<any> {
        return await this.hashTagRepository.updateOne(query, newValue);
    }

    public async updateMany(query:any,newValue:any): Promise<any>{
        return await this.hashTagRepository.updateMany(query,newValue);
    }

    // delete hashTag
    public async delete(query: any, options?: any): Promise<any> {
        return this.hashTagRepository.deleteOne(query, options);
    }

    // find hashTag
    public find(query?: any): Promise<any[]> {
        return this.hashTagRepository.find(query);
    }

    // find user
    public aggregate(query: any, options?: any): Promise<any> {
        return this.hashTagRepository.aggregate(query, options).toArray();
    }

    // Search HashTag
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.hashTagRepository.count();
        } else {
            return this.hashTagRepository.find(condition);
        }
    }
}
