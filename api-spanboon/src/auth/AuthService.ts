/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import * as express from 'express';
import jwt from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { env } from '../env';
import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';
import { FacebookService } from '../api/services/FacebookService';
import { TwitterService } from '../api/services/TwitterService';

@Service()
export class AuthService {

    constructor(@OrmRepository() private userRepository: UserRepository, private facebookService: FacebookService, private twitterService: TwitterService) { }

    public async parseBasicAuthFromRequest(req: express.Request): Promise<any> {
        const authorization = req.header('authorization');
        const mode = req.header('mode');

        console.log('authorization >>>> ', authorization);

        if (authorization !== null && authorization !== undefined) {
            const prefix = authorization.split(' ')[0];

            if (prefix === 'Bearer') {
                if (!authorization) {
                    return undefined;
                }

                const token = authorization.split(' ')[1];

                let UserId = undefined;
                // check in fb mode
                if (mode === 'FB') {
                    const fbUserObj = await this.facebookService.getFacebookUser(token);

                    if (fbUserObj !== undefined && fbUserObj.user.id !== undefined) {
                        UserId = fbUserObj.user.id;
                    }
                } if (mode === 'TW') {
                    const twToken = token;
                    const splitString = twToken.split('&');
                    const keyMap = {};
                    if (splitString.length > 0) {
                        for (const value of splitString) {
                            const splitValue = value.split('=');
                            if (splitValue.length < 2) {
                                continue;
                            }
                            const key = splitValue[0];
                            const val = splitValue[1];
                            keyMap[key] = val;
                        }
                    }
                    console.log('keyMap',keyMap);
                    // ! re implement this when fix bug
                    if (keyMap['user_id'] !== undefined) {
                        const twUserObj: any = await this.twitterService.getTwitterUser(keyMap['user_id']);
                        console.log('twUserObj', twUserObj);

                        if (twUserObj !== undefined && twUserObj.id !== undefined) {
                            UserId = twUserObj.id;
                        }
                    }
                } else {
                    UserId = await this.decryptToken(token);
                }

                return UserId;
            }

            return undefined;
        }
    }

    public async decryptToken(encryptString: string): Promise<number> {
        return new Promise<number>((subresolve, subreject) => {
            jwt.verify(encryptString, env.SECRET_KEY, (err, decoded) => {
                if (err) {
                    return subresolve(undefined);
                }
                return subresolve(decoded.id);
            });
        });
    }

    public async validateUser(userId: any): Promise<User> {
        const uid = new ObjectID(userId);

        const user = await this.userRepository.findOne({ where: { _id: uid } });

        console.log(user);

        if (user) {
            return user;
        }

        return undefined;
    }

    public async validateAdmin(userId: any): Promise<any> {
        const uid = new ObjectID(userId);
        const customer = await this.userRepository.findOne({ where: { _id: uid, isAdmin: true } });

        console.log(customer);

        if (customer) {
            return customer;
        }

        return undefined;
    }
}
