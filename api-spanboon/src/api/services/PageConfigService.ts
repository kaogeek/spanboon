/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { ObjectID } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchUtil } from '../../utils/SearchUtil';
import { PageConfigRepository } from '../repositories/PageConfigRepository';

@Service()
export class PageConfigService {
    constructor(@OrmRepository() private pageConfigRepository: PageConfigRepository) { }

    // create config
    public async create(config: any): Promise<any> {
        return await this.pageConfigRepository.save(config);
    }

    // find one config
    public async findOne(config: any): Promise<any> {
        return await this.pageConfigRepository.findOne(config);
    }

    // find all config
    public async findAll(): Promise<any> {
        return await this.pageConfigRepository.find();
    }

    // edit config
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageConfigRepository.updateOne(query, newValue);
    }

    public updateMany(query: any, newValue: any): Promise<any> {
        return this.pageConfigRepository.updateMany(query, newValue);
    }

    public async getConfig(name: string, pageId: ObjectID): Promise<any> {
        const condition = { name, page: pageId };
        return await this.pageConfigRepository.findOne(condition);
    }

    // config List
    public async search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return await this.pageConfigRepository.count(condition);
        } else {
            return await this.pageConfigRepository.find(condition);
        }
    }

    // delete config
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageConfigRepository.deleteOne(query, options);
    }

    // delete Many
    public async deleteMany(query:any,options?:any): Promise<any>{
        return await this.pageConfigRepository.deleteMany(query,options);
    }
}