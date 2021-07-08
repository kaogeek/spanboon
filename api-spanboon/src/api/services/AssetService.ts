/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Asset } from '../models/Asset';
import { AssetRepository } from '../repositories/AssetRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { FileUtil } from '../../utils/FileUtil';
import { ASSET_CONFIG_NAME, DEFAULT_ASSET_CONFIG_VALUE } from '../../constants/SystemConfig';
import { S3Service } from '../services/S3Service';
import { ConfigService } from '../services/ConfigService';

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

    // create asset
    public async create(asset: Asset): Promise<Asset> {
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
        return await this.assetRepository.updateOne(query, newValue);
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
}
