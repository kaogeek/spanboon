/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import * as https from 'https';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Asset } from '../models/Asset';
import { AssetRepository } from '../repositories/AssetRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { FileUtil } from '../../utils/FileUtil';
import { ASSET_CONFIG_NAME, DEFAULT_ASSET_CONFIG_VALUE } from '../../constants/SystemConfig';
import { S3Service } from '../services/S3Service';
import { ConfigService } from '../services/ConfigService';
// import { aws_setup } from '../../env';
import { ASSET_SCOPE } from '../../constants/AssetScope';
import { ObjectID } from 'mongodb';
@Service()
export class AssetService {

    constructor(@OrmRepository() private assetRepository: AssetRepository, private configService: ConfigService, private s3Service: S3Service) { }

    // find asset
    public async find(findCondition: any): Promise<any> {
        return await this.assetRepository.find(findCondition);
    }

    // find asset
    public findOne(findCondition: any): Promise<any> {
        return this.assetRepository.findOne(findCondition);
    }

    // deleteMany
    public async deleteMany(query: any, options?: any): Promise<any> {
        return this.assetRepository.deleteMany(query, options);
    }

    // create asset
    public async create(asset: Asset): Promise<Asset> {
        // s3 upload by cofig
        const assetUploadToS3 = this._isUploadToS3();

        if (assetUploadToS3) {
            try {
                const base64Data = Buffer.from(asset.data, 'base64');
                let s3Path = asset.userId + '/' + asset.fileName;
                s3Path = FileUtil.appendFileType(s3Path, asset.mimeType);
                const s3Result = await this.s3Service.imageUpload(s3Path, base64Data, asset.mimeType);

                if (s3Result.path !== undefined) {
                    asset.s3FilePath = s3Path;
                }
            } catch (error) {
                console.log('Cannot Store to S3: ', error);
            }
        }
        return await this.assetRepository.save(asset);
    }

    // update asset
    public async update(query: any, newValue: any): Promise<any> {
        let updatedAsset: any = await this.assetRepository.updateOne(query, newValue);
        // s3 upload by cofig
        const assetUploadToS3 = this._isUploadToS3();
        const currentAsset = await this.assetRepository.findOne(query);

        if (assetUploadToS3 && currentAsset !== undefined && currentAsset.data !== undefined) {
            // delete old asset
            try {
                const toDeleteS3Path = currentAsset.s3FilePath;
                await this.s3Service.deleteFile(toDeleteS3Path);
            } catch (error) {
                console.log('Cannot Delete file from S3: ', error);
            }

            // create new
            try {
                const base64Data = Buffer.from(currentAsset.data, 'base64');
                let s3Path = currentAsset.userId + '/' + currentAsset.fileName;
                s3Path = FileUtil.appendFileType(s3Path, currentAsset.mimeType);
                const s3Result = await this.s3Service.imageUpload(s3Path, base64Data, currentAsset.mimeType);

                if (s3Result.path !== undefined) {
                    // update s3 path
                    currentAsset.s3FilePath = s3Path;
                    updatedAsset = await this.assetRepository.updateOne(query, { $set: { s3FilePath: s3Path } });
                }
            } catch (error) {
                console.log('Cannot Store to S3: ', error);
            }
        }

        return updatedAsset;
    }

    // delete asset
    public async delete(query: any, options?: any): Promise<any> {
        const assets: Asset[] = await this.find(query);
        for (const asset of assets) {
            if (asset.s3FilePath !== undefined && asset.s3FilePath !== '') {
                try {
                    const s3Path = asset.s3FilePath;
                    await this.s3Service.deleteFile(s3Path);
                } catch (error) {
                    console.log('Cannot Delete file from S3: ', error);
                }
            }
        }
        return await this.assetRepository.deleteOne(query, options);
    }

    // find asset
    public findAll(): Promise<any> {
        return this.assetRepository.find();
    }

    // Search Asset
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.assetRepository.count(condition);
        } else {
            return this.assetRepository.find(condition);
        }
    }

    public async getAssetSignedUrl(findCondition: any): Promise<any> {
        const asset = await this.findOne(findCondition);

        if (asset !== undefined && asset.s3FilePath !== undefined && asset.s3FilePath !== '' && asset.s3FilePath !== null) {
            // s3 upload by cofig
            const signExpireConfig = await this.configService.getConfig(ASSET_CONFIG_NAME.EXPIRE_MINUTE);
            // let expireSecond = DEFAULT_ASSET_CONFIG_VALUE.EXPIRE_MINUTE;

            if (signExpireConfig && signExpireConfig.value) {
                try {
                    if (typeof signExpireConfig.value === 'number') {
                        // expireSecond = signExpireConfig.value;
                    } else if (typeof signExpireConfig.value === 'string') {
                        // expireSecond = parseFloat(signExpireConfig.value);
                    }
                } catch (error) {
                    console.log(ASSET_CONFIG_NAME.EXPIRE_MINUTE + ' value was wrong.');
                }
            }

            const signURL = await this.s3Service.s3signCloudFront(asset.s3FilePath);
            /* 
            if (signURL !== undefined) {
                for (const prefix of this.s3Service.getPrefixBucketURL()) {
                    signURL = signURL.replace(prefix, aws_setup.AWS_CLOUDFRONT_PREFIX);
                }
            } */
            asset.signURL = signURL;
            delete asset.s3FilePath;
            delete asset.data;

        }

        return asset;
    }

    public createAssetFromURL(url: string, userId: ObjectID): Promise<Asset> {
        if (url === undefined || url === null || url === '') {
            return Promise.resolve(undefined);
        }

        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                res.setEncoding('base64');
                console.log(`createAssetFromURL STATUS: ${res.statusCode}`);

                let data = '';
                res.on('data', (d) => {
                    data += d;
                });

                res.on('end', () => {
                    if (data !== undefined && data !== '') {
                        const mimeType = res.headers['content-type'];
                        const fileName = FileUtil.renameFile();

                        if (mimeType === undefined) {
                            resolve(undefined);
                            return;
                        }

                        const buffData = Buffer.from(data, 'base64');
                        const asset: Asset = new Asset();
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        asset.userId = userId;
                        asset.fileName = fileName;
                        asset.data = data;
                        asset.mimeType = mimeType;
                        asset.size = buffData.length;
                        asset.expirationDate = null;

                        this.create(asset).then((savedAsset) => {
                            resolve(savedAsset);
                        }).catch((err) => {
                            console.log('err: ' + err);
                            reject(err);
                        });
                    } else {
                        resolve(undefined);
                    }
                });

            }).on('error', (err) => {
                // Handle error
                console.log('err: ' + err);
                reject(err);
            }).end();
        });
    }

    private async _isUploadToS3(): Promise<boolean> {
        // s3 upload by cofig
        const assetUploadToS3Cfg = await this.configService.getConfig(ASSET_CONFIG_NAME.S3_STORAGE_UPLOAD);
        let assetUploadToS3 = DEFAULT_ASSET_CONFIG_VALUE.S3_STORAGE_UPLOAD;

        if (assetUploadToS3Cfg && assetUploadToS3Cfg.value) {
            if (typeof assetUploadToS3Cfg.value === 'boolean') {
                assetUploadToS3 = assetUploadToS3Cfg.value;
            } else if (typeof assetUploadToS3Cfg.value === 'string') {
                assetUploadToS3 = (assetUploadToS3Cfg.value.toUpperCase() === 'TRUE');
            }
        }

        return assetUploadToS3;
    }
}
