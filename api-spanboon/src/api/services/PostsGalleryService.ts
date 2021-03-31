/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PostsGallery } from '../models/PostsGallery';
import { PostsGalleryRepository } from '../repositories/PostsGalleryRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class PostsGalleryService {

    constructor(@OrmRepository() private postGalleryRepository: PostsGalleryRepository) { }

    // find postGallery
    public find(findCondition: any): Promise<PostsGallery[]> {
        return this.postGalleryRepository.find(findCondition);
    }

    // find postGallery
    public findOne(findCondition: any): Promise<PostsGallery> {
        return this.postGalleryRepository.findOne(findCondition);
    }

    // create postGallery
    public async create(postGallery: PostsGallery): Promise<PostsGallery> {
        return await this.postGalleryRepository.save(postGallery);
    }

    // aggregate postGallery
    public async aggregate(query: any, options?: any): Promise<PostsGallery[]> {
        return await this.postGalleryRepository.aggregate(query, options).toArray();
    }

    // aggregate postGallery
    public async aggregateEntity(query: any, options?: any): Promise<PostsGallery[]> {
        return await this.postGalleryRepository.aggregateEntity(query, options).toArray();
    }

    // update postGallery
    public async update(query: any, newValue: any): Promise<any> {
        return await this.postGalleryRepository.updateOne(query, newValue);
    }

    // delete postGallery
    public async delete(query: any, options?: any): Promise<any> {
        return await this.postGalleryRepository.deleteOne(query, options);
    }

    // delete postGallery
    public async deleteMany(query: any, options?: any): Promise<any> { 
        return await this.postGalleryRepository.deleteMany(query, options);
    }

    // Search PostsGallery
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.postGalleryRepository.count();
        } else {
            return this.postGalleryRepository.find(condition);
        }
    }
}
