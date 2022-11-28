/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { DeviceTokenRepository } from '../repositories/DeviceToken';
@Service()
export class DeviceTokenService {

    constructor(
        @OrmRepository() private deviceTokenRepository:DeviceTokenRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async createDeviceToken(data:any):Promise<any>{
        this.log.info('create a token Firebase cloud messaging');
        return await this.deviceTokenRepository.save(data);
    }

    public async findOne(findCondition:any):Promise<any>{
        return await this.deviceTokenRepository.findOne(findCondition);
    }

    public async findPeople(findCondition?:any):Promise<any>{
        return await this.deviceTokenRepository.find(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.deviceTokenRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a token');
        return await this.deviceTokenRepository.deleteOne(query, options);
    }

    public async updateToken(query: any, newValue: any): Promise<any> {
        this.log.info('Update a token');

        return await this.deviceTokenRepository.updateOne(query, newValue);
    }
}
