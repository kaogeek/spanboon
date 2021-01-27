/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchUtil } from '../../utils/SearchUtil';
import { UserConfigRepository } from '../repositories/UserConfigRepository';

@Service()
export class UserConfigService {
    constructor(@OrmRepository() private userConfigRepository: UserConfigRepository) { }

    // create config
    public async create(config: any): Promise<any> {
        return await this.userConfigRepository.save(config);
    }

    // find one config
    public async findOne(config: any): Promise<any> {
        return await this.userConfigRepository.findOne(config);
    }

    // find all config
    public async findAll(): Promise<any> {
        return await this.userConfigRepository.find();
    }

    // edit config
    public async update(query: any, newValue: any): Promise<any> {
        return await this.userConfigRepository.updateOne(query, newValue);
    }

    public async getConfig(name: string): Promise<any> {
        const condition = { name };
        return await this.userConfigRepository.findOne(condition);
    }

    // config List
    public async search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return await this.userConfigRepository.count(condition);
        } else {
            return await this.userConfigRepository.find(condition);
        }
    }

    // delete config
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userConfigRepository.deleteOne(query, options);
    }
}
