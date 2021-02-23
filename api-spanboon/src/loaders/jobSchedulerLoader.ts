/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { env } from '../env';
import * as schedule from 'node-schedule';
import * as http from 'http';

/* 
* This will set job schedule for Clear Temp File
*/
export const jobSchedulerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    // Run Every Hour
    // Clear Temp File
    schedule.scheduleJob('*/5 * * * *', () => {
        const clearTempOptions: any = {
            host: env.app.host,
            port: env.app.port,
            path: env.app.routePrefix + '/file/temp',
            method: 'DELETE'
        };

        http.request(clearTempOptions, (res) => {
            console.log(`CLEAR TEMP FILE STATUS: ${res.statusCode}`);
        }).on('error', (err) => {
            // Handle error
            console.log('err: ' + err);
        }).end();
    });

    // Run Every 3 Hour
    // update page token
    schedule.scheduleJob('0 */3 * * *', () => {
        const options: any = {
            host: env.app.host,
            port: env.app.port,
            path: env.app.routePrefix + '/jobs/extended_token',
            method: 'POST'
        };

        http.request(options, (res) => {
            console.log(`Extended Page Token STATUS: ${res.statusCode}`);
        }).on('error', (err) => {
            // Handle error
            console.log('err: ' + err);
        }).end();
    });
};
