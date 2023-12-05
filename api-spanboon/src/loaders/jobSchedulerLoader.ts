/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import * as schedule from 'node-schedule';
import axios from 'axios';
/* 
* This will set job schedule for Clear Temp File
*/
export const jobSchedulerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    // Run Every Hour
    // Clear Temp File
    schedule.scheduleJob('*/5 * * * *', () => {
        axios.post(process.env.APP_DELETE_TEMP, {
            headers: {
                Origin: process.env.APP_API_PROCESSV3,
                Referer: process.env.APP_API_PROCESSV3,
            }
        }).then((res) => {
            console.log(`Clear Temp File : ${res.status}`);
        }).catch((err) => {
            console.log('err: ' + err);
        });
    });

    // Run Every 3 Hour
    // update page token
    schedule.scheduleJob('0 */3 * * *', () => {
        axios.post(process.env.APP_UPDATE_TOKEN, {
            headers: {
                Origin: process.env.APP_API_PROCESSV3,
                Referer: process.env.APP_API_PROCESSV3
            }
        }).then((res) => {
            console.log(`update page token : ${res.status}`);
        }).catch((err) => {
            console.log('err: ' + err);
        });
    });

    // auto approve
    // Run Every 1 hour
    schedule.scheduleJob('0 */1 * * *', () => {
        const data = {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        };
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:4300',
                'Referer': 'http://localhost:4300',
                'mode': 'EMAIL'
            },
        };
        axios.post(process.env.APP_LOGIN,data,options)
        .then((res) => {
            const underOption = {
                headers:{
                    'Authorization': 'Bearer'+' '+res.data.data.token,
                    'Content-Type': 'application/json',
                    'Origin': 'http://localhost:4300',
                    'Referer': 'http://localhost:4300',
                }
            };
            axios.post(process.env.APP_AUTO_APPROVE,{},underOption)
            .then((response) => {
                console.log('RESPONSE ==== : ', response.data);
            })
            .catch((error) => {
                console.log('ERROR: ====', error);
            });
        })
        .catch((err) => {
            console.log('ERROR: ====', err);
        });
    });

    // auto close
    // Run Every 1 hour
    schedule.scheduleJob('0 */1 * * *', () => {
        const data = {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        };
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:4300',
                'Referer': 'http://localhost:4300',
                'mode': 'EMAIL'
            },
        };
        axios.post(process.env.APP_LOGIN,data,options)
        .then((res) => {
            const underOption = {
                headers:{
                    'Authorization': 'Bearer'+' '+res.data.data.token,
                    'Content-Type': 'application/json',
                    'Origin': 'http://localhost:4300',
                    'Referer': 'http://localhost:4300',
                }
            };
            axios.post(process.env.APP_AUTO_CLOSED,{},underOption)
            .then((response) => {
                console.log('RESPONSE ==== : ', response.data);
            })
            .catch((error) => {
                console.log('ERROR: ====', error);
            });
        })
        .catch((err) => {
            console.log('ERROR: ====', err);
        });
    });
};
