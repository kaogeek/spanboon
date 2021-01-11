/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PostsComment } from '../models/PostsComment';
import { PostsCommentRepository } from '../repositories/PostsCommentRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class PostsCommentService {

    constructor(@OrmRepository() private postsCommentRepository: PostsCommentRepository) { }

    // find postsComment
    public find(findCondition: any): Promise<PostsComment[]> {
        return this.postsCommentRepository.find(findCondition);
    }

    // find postsComment
    public findOne(findCondition: any): Promise<PostsComment> {
        return this.postsCommentRepository.findOne(findCondition);
    }

    // create postsComment
    public async create(postsComment: PostsComment): Promise<PostsComment> {
        return await this.postsCommentRepository.save(postsComment);
    }

    // update postsComment
    public update(query: any, newValue: any): Promise<any> {
        return this.postsCommentRepository.updateOne(query, newValue);
    }

    // delete postsComment
    public async delete(query: any, options?: any): Promise<any> {
        return await this.postsCommentRepository.deleteOne(query, options);
    }

    // delete postsComment
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.postsCommentRepository.deleteMany(query, options);
    }

    // aggregate postsComment
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.postsCommentRepository.aggregate(query, options).toArray();
    }

    // aggregate postsComment
    public aggregateEntity(query: any, options?: any): Promise<PostsComment[]> {
        return this.postsCommentRepository.aggregateEntity(query, options).toArray();
    }

    // Search Post
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.postsCommentRepository.count(search.whereConditions);
        } else {
            return this.postsCommentRepository.find(condition);
        }
    }
}
