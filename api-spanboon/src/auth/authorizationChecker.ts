/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';
import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';

export function authorizationChecker(connection: Connection): (action: Action, roles: string[]) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);

    return async function innerAuthorizationChecker(action: Action, roles: any): Promise<boolean> {
        // here you can use request/response objects from action
        // also if decorator defines roles it needs to access the action
        // you can use them to provide granular access check
        // checker must return either boolean (true or false)
        // either promise that resolves a boolean value
        let userId = await authService.parseBasicAuthFromRequest(action.request);

        if (userId === null || userId === undefined) {
            log.warn('No credentials given');
            return false;
        }

        log.debug('roles >>> ', roles);

        if (roles[0] === 'user') {
            let loginType = undefined;
            const splitId: string[] = userId.split(';');
            if(splitId.length >= 2){
                userId = splitId[0];
                loginType = splitId[1];
            }
            console.log('userId check: ' + userId);
            action.request.user = await authService.validateUser(userId, loginType);

            if (action.request.user === undefined) {
                log.warn('Invalid credentials given');
                return false;
            } else {
                log.info('Successfully checked credentials');
                return true;
            }
        } else {
            console.log('validate admin');
            const splitId: string[] = userId.split(';');
            if(splitId.length >= 2){
                userId = splitId[0];
            }
            action.request.user = await authService.validateAdmin(userId);
            if (action.request.user === undefined) {
                log.warn('Invalid credentials given');
                return false;
            } else {
                log.info('Successfully checked credentials');
                return true;
            }
        }
    };
}
