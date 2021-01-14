/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */
import { IsNotEmpty } from 'class-validator';

export class PageSocialFBBindingRequest {

    @IsNotEmpty({ message: 'accessToken is required' })
    public accessToken: string;

    @IsNotEmpty({ message: 'facebookPageId is required' })
    public facebookPageId: string;

    @IsNotEmpty({ message: 'fbAccessExpirationTime is required' })
    public fbAccessExpirationTime: string;

    @IsNotEmpty({ message: 'fbSignedRequest is required' })
    public fbSignedRequest: string;
}