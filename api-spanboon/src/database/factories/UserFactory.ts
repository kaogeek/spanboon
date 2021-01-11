/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import * as Faker from 'faker';
import { define } from 'typeorm-seeding';
import { User } from '../../api/models/User';
define(User, (faker: typeof Faker, settings: { role: string[] }) => {
    const user = new User();
    user.username = 'tester2@spanboon.com';
    user.email = 'tester2@spanboon.com';
    user.isAdmin = false;
    return user;
});
