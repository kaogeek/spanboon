/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SearchUtil } from '../../utils/SearchUtil';
import { Config } from '../models/Config';
import { ConfigRepository } from '../repositories/ConfigRepository';

@Service()
export class ConfigService {
    constructor(@OrmRepository() private configRepository: ConfigRepository) { }

    // create config
    public async create(config: any): Promise<Config> {
        return await this.configRepository.save(config);
    }

    // find one config
    public async findOne(config: any): Promise<Config> {
        return await this.configRepository.findOne(config);
    }

    // find all config
    public async findAll(): Promise<Config[]> {
        return await this.configRepository.find();
    }

    // edit config
    public async update(query: any, newValue: any): Promise<any> {
        return await this.configRepository.updateOne(query, newValue);
    }

    public async getConfig(name: string): Promise<Config> {
        const condition = { name };
        return await this.configRepository.findOne(condition);
    }

    // config List
    public async search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);
        if (count) {
            return await this.configRepository.count(condition);
        } else {
            return await this.configRepository.find(condition);
        }
    }

    // delete config
    public async delete(query: any, options?: any): Promise<any> {
        return await this.configRepository.deleteOne(query, options);
    }
}
