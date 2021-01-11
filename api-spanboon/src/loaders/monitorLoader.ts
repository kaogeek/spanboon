/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import basicAuth from 'express-basic-auth';
import monitor from 'express-status-monitor';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import { env } from '../env';

export const monitorLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings && env.monitor.enabled) {
        const expressApp = settings.getData('express_app');

        expressApp.use(monitor());
        expressApp.get(
            env.monitor.route,
            env.monitor.username ? basicAuth({
                users: {
                    [`${env.monitor.username}`]: env.monitor.password,
                },
                challenge: true,
            }) : (req, res, next) => next(),
            monitor().pageRoute
        );

    }
};
