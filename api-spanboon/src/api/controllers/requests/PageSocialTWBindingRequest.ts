/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */
import { IsNotEmpty } from 'class-validator';

export class PageSocialTWBindingRequest {

    @IsNotEmpty({ message: 'twitterUserId is required' })
    public twitterUserId: string;
    @IsNotEmpty({ message: 'twitterOauthToken is required' })
    public twitterOauthToken: string;
    @IsNotEmpty({ message: 'twitterTokenSecret is required' })
    public twitterTokenSecret: string;
    @IsNotEmpty({ message: 'twitterPageName is required' })
    public twitterPageName: string;
}