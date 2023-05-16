/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { IsReadPostRepository } from '../repositories/IsReadRepository';
@Service()
export class IsReadPostService {

    constructor(
        @OrmRepository() private isReadPostRepository: IsReadPostRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create is Read.');
        return await this.isReadPostRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.isReadPostRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.isReadPostRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a token');
        return await this.isReadPostRepository.deleteOne(query, options);
    }

    public async updateToken(query: any, newValue: any): Promise<any> {
        this.log.info('Update a token');

        return await this.isReadPostRepository.updateOne(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.isReadPostRepository.aggregate(query, options).toArray();
    }
}
