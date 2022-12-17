/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */
import { IsNotEmpty } from 'class-validator';

export class PageSocialFBBindingRequest {

    @IsNotEmpty({ message: 'facebookPageId is required' })
    public facebookPageId: string;

    @IsNotEmpty({ message: 'facebookPageName is required' })
    public facebookPageName: string;

    public pageAccessToken: string;

    public facebookCategory:string;
}