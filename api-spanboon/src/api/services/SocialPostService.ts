/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SocialPost } from '../models/SocialPost';
import { SocialPostRepository } from '../repositories/SocialPostRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class SocialPostService {

    constructor(@OrmRepository() private socialPostRepository: SocialPostRepository) { }

    // find post
    public async find(findCondition: any): Promise<SocialPost[]> {
        return await this.socialPostRepository.find(findCondition);
    }

    // find post
    public async findOne(findCondition: any): Promise<SocialPost> {
        return await this.socialPostRepository.findOne(findCondition);
    }

    // create post
    public async create(post: SocialPost): Promise<SocialPost> {
        return await this.socialPostRepository.save(post);
    }

    // update post
    public update(query: any, newValue: any): Promise<any> {
        return this.socialPostRepository.updateOne(query, newValue);
    }

    // update many post
    public updateMany(query: any, newValue: any): Promise<any> {
        return this.socialPostRepository.updateMany(query, newValue);
    }

    // delete post
    public async delete(query: any, options?: any): Promise<any> {
        return await this.socialPostRepository.deleteOne(query, options);
    }

    // aggregate post
    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.socialPostRepository.aggregate(query, options).toArray();
    }

    // find SocialPost Agg
    public aggregateEntity(query: any, options?: any): Promise<SocialPost[]> {
        return this.socialPostRepository.aggregateEntity(query, options).toArray();
    }

    // select distinct post
    public async distinct(key: any, query: any, options?: any): Promise<any> {
        return await this.socialPostRepository.distinct(key, query, options);
    }

    // Search Post
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.socialPostRepository.count(search.whereConditions);
        } else {
            return this.socialPostRepository.find(condition);
        }
    }
}