/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AssetService } from '../api/services/AssetService';
import { ImageUtil } from './ImageUtil';
import { JSDOM } from 'jsdom';
import { spanboon_web } from '../env';

export class PostUtil {
    public static IMG_ID_PREFIX = '$$';

    public static getImageIdsFromStory(text: string): string[] {
        const result = [];
        if (text === undefined || text === null || text === '') {
            return result;
        }

        const dom = new JSDOM(text);
        const imgElements = dom.window.document.querySelectorAll('img');
        imgElements.forEach((item) => {
            let imgId = item.getAttribute('id');

            if (imgId && imgId !== '') {
                if (imgId.startsWith(PostUtil.IMG_ID_PREFIX)) {
                    imgId = imgId.substring(PostUtil.IMG_ID_PREFIX.length, imgId.length);

                    if (imgId !== '') {
                        result.push(imgId);
                    }
                }
            }
        });

        return result;
    }

    public static async parseImagePostStory(text: string, assetService: AssetService, useS3Link?: boolean): Promise<string> {
        if (assetService === undefined || assetService === null) {
            useS3Link = false;
        }

        if (text === undefined || text === null || text === '') {
            return text;
        }

        const imgs = this.getImageIdsFromStory(text);
        let parsingText = text;
        if (imgs.length <= 0) {
            return text;
        }

        const fileMapping = {};
        const root = (spanboon_web.ROOT_URL === undefined || spanboon_web.ROOT_URL === null) ? '' : spanboon_web.ROOT_URL;
        for (const imageId of imgs) {
            const imgKey = PostUtil.IMG_ID_PREFIX + imageId;
            if (!useS3Link) {
                if (!fileMapping[imgKey]) {
                    fileMapping[imgKey] = root + '/api/file/' + imageId + '/image';
                }
            } else {
                // use s3 link
                const options = { prefix: '/file/' };
                const signURL = await ImageUtil.generateAssetSignURL(assetService, imageId, options);
                if (!fileMapping[imgKey]) {
                    fileMapping[imgKey] = signURL;
                }
            }
        }

        const dom = new JSDOM(text);
        const imgElements = dom.window.document.querySelectorAll('img');
        imgElements.forEach((item) => {
            const imgId = item.getAttribute('id');

            if (imgId && fileMapping[imgId]) {
                item.setAttribute('src', fileMapping[imgId]);
            } else {
                if (imgId.length >= PostUtil.IMG_ID_PREFIX.length) {
                    const realImgId = imgId.substring(PostUtil.IMG_ID_PREFIX.length, imgId.length);
                    item.setAttribute('src', root + '/api/file/' + realImgId + '/image');
                }
            }
        });

        parsingText = dom.serialize();
        parsingText = parsingText.replace('<html><head></head><body>', '');
        parsingText = parsingText.replace('</body></html>', '');

        return parsingText;
    }
}