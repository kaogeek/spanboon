/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { ObjectID } from 'mongodb';
import { AssetService } from '../api/services/AssetService';

export class ImageUtil {
    public static async generateAssetSignURL(assetService: AssetService, imageId: string, options?: any): Promise<string> {
        if (assetService === undefined || assetService === null) {
            return imageId;
        }

        if (imageId === undefined || imageId === null || imageId === '') {
            return imageId;
        }

        // options is an extra config for generate signURL
        // prefix is prefix for imageId to be remove with replace 
        let prefix = undefined;
        if (options !== undefined && options !== null) {
            prefix = options.prefix;
        }

        let finalImageId = imageId;
        if (prefix !== undefined) {
            finalImageId = finalImageId.replace(prefix, '');
        }

        let signURL = '';
        try {
            const asset = await assetService.getAssetSignedUrl({ _id: new ObjectID(finalImageId) });
            signURL = asset ? asset.signURL : '';
        } catch (error) {
            console.log(error);
        }

        return signURL;
    }
}