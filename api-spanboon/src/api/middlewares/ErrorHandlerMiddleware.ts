/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { ValidationError } from 'class-validator';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { env } from '../../env';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {

    public isProduction = env.isProduction;

    constructor(
        @Logger(__filename) private log: LoggerInterface
    ) { }

    /**
     * Error handler - sets response code and sends json with error message.
     * Handle: standard node error, HttpError, ValidationError and string.
     *
     * @param {any} error An throwed object (error)
     * @param {express.Request} req The Express request object
     * @param {express.Response} res The Express response object
     * @param {express.NextFunction} next The next Express middleware function
     */
    public error(error: any, _req: express.Request, res: express.Response, _next: express.NextFunction): void {
        const responseObject = {} as any;
        // if its an array of ValidationError
        // console.log(error);
        // console.log(Array.isArray(error));
        if (error && Array.isArray(error.errors) && error.errors.every((element) => element instanceof ValidationError)) {
            res.status(422);
            console.log('Inside');
            responseObject.message = "You have an error in your request's body. Check 'errors' field for more details!";
            // responseObject.errors = error;
            responseObject.status = 0;
            responseObject.data = {};
            responseObject.data.message = [];
            console.log('ErrorHandleMiddleware_1',responseObject);
            error.errors.forEach((element: ValidationError) => {
                console.log('ErrorHandleMiddleware_2',element);
                Object.keys(element.constraints).forEach((type) => {
                    console.log('ErrorHandleMiddleware_3',type);
                    responseObject.data.message.push(`property ${element.constraints[type]}`);
                });
            });
        } else {
            // set http status
            if (error instanceof HttpError && error.httpCode) {
                console.log('Error.httpCode_1',error.httpCode);
                res.status(error.httpCode);
            } else {
                console.log('Error.httpCode_2');
                res.status(500);
            }

            if (error instanceof Error) {
                const developmentMode: boolean = !this.isProduction;

                // set response error fields
                if (error.name && (developmentMode || error.message)) { // show name only if in development mode and if error message exist too
                    responseObject.name = error.name;
                }
                switch (error.name) {
                    case 'AuthorizationRequiredError':
                        
                        responseObject.message = 'Unauthorized';
                        break;
                    default:
                        responseObject.message = error.message;
                        break;
                }

                if (error.stack && developmentMode) {
                    responseObject.stack = error.stack;
                }
            } else if (typeof error === 'string') {
                responseObject.message = error;
            }
        }

        if (this.isProduction) {
            this.log.error(error.name, error.message);
        } else {
            this.log.error(error.name, error.stack);
        }

        // send json only with error
       res.json(responseObject);
    }

}
