/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { HidePostRepository } from '../repositories/HidePostRepository';
@Service()
export class HidePostService {

    constructor(
        @OrmRepository() private hidePostRepository: HidePostRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create is hide post.');
        return await this.hidePostRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.hidePostRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.hidePostRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a hide post');
        return await this.hidePostRepository.deleteOne(query, options);
    }

    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update hide post');

        return await this.hidePostRepository.updateOne(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.hidePostRepository.aggregate(query, options).toArray();
    }
    public async findOneAndUpdate(query: any, update: any, options?: any): Promise<any> {
        return await this.hidePostRepository.findOneAndUpdate(query, update, options);
    }
}
