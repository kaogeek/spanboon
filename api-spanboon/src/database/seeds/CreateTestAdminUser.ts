/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../../api/models/User';
export class CreateTestAdminUser implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const em = connection.createEntityManager();
        const user = new User();
        user.username = 'admin@spanboon.com';
        user.password = await User.hashPassword('admin');
        user.email = 'admin@spanboon.com';
        user.isAdmin = true;
        return await em.save(user);
    }
}
