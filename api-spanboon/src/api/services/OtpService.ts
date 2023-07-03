/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { OtpRepository } from '../repositories/OtpRepository';
@Service()
export class OtpService {

    constructor(
        @OrmRepository() private otpRepository: OtpRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async createOtp(data: any): Promise<any> {
        this.log.info('Send OTP.');
        return await this.otpRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.otpRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.otpRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a token');
        return await this.otpRepository.deleteOne(query, options);
    }
    // delete Needs
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.otpRepository.deleteMany(query, options);
    }
    public async updateToken(query: any, newValue: any): Promise<any> {
        this.log.info('Update a token');

        return await this.otpRepository.updateOne(query, newValue);
    }
}
