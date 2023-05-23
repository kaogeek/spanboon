/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { UserService } from '../api/services/UserService';
import { Container } from 'typedi';
import { ConfigService } from '../api/services/ConfigService';
import { CreateUserRequest } from '../api/controllers/requests/CreateUserRequest';

export const configDefaultLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    const configService = Container.get<ConfigService>(ConfigService);
    const userService = Container.get<UserService>(UserService);

    configService.initialConfig();

    const userData = new CreateUserRequest();
    userData.firstName = 'MFP Today';
    userData.lastName = 'Admin';
    userData.displayName = 'MFP Today Admin';
    userData.email = 'admin@moveforwardparty.org';
    userData.password = 'dhk;wd]';
    userData.isAdmin = true;

    userService.createUser(userData);
};
