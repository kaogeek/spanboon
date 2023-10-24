/*
 * @license Spanboon Platform v0.1
 * (c) 2021 PICCOSOFT
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author piccosoft <support@spurtcommerce.com>
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import * as AWS from 'aws-sdk'; // Load the SDK for JavaScript
import { Service } from 'typedi';
import { aws_setup } from '../../env';
import * as fs from 'fs';
import { DEFAULT_ASSET_CONFIG_VALUE, ASSET_CONFIG_NAME } from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';
import * as path from 'path';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
const s3 = new AWS.S3();

@Service()
export class S3Service {

    constructor(private configService: ConfigService) { }

    // Bucket list
    public listBucker(limit: number = 0, marker: string = '', folderName: string = ''): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        // Create the parameters for calling createBucket
        const bucketParams = {
            Bucket: aws_setup.AWS_BUCKET,
            MaxKeys: limit,
            Delimiter: '/',
            Prefix: folderName,
            // StartAfter: '',
            Marker: marker,
        };

        return new Promise((resolve, reject) => {
            return s3.listObjects(bucketParams, (err: any, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    // create folder
    public createFolder(folderName: string = ''): Promise<any> {
        // overide if folderName not include / in the end of the name.
        if (folderName !== undefined || folderName !== '' || folderName !== null) {
            if (!folderName.endsWith('/')) {
                folderName += '/';
            }
        }

        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        // Create the parameters for calling createBucket
        const bucketParams = {
            Bucket: aws_setup.AWS_BUCKET,
            Key: folderName,
        };

        return new Promise((resolve, reject) => {
            return s3.putObject(bucketParams, (err: any, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    // delete folder
    public deleteFolder(folderName: string = ''): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        // Create the parameters for calling createBucket
        const bucketParams = {
            Bucket: aws_setup.AWS_BUCKET,
            Prefix: folderName,
        };

        return new Promise((resolve, reject) => {
            s3.listObjects(bucketParams, (err: any, data: any) => {
                if (err) {
                    reject(err);
                }
                const objects = data.Contents.map(object => ({ Key: object.Key }));
                return s3.deleteObjects({
                    Bucket: aws_setup.AWS_BUCKET,
                    Delete: {
                        Objects: objects,
                        Quiet: true,
                    },
                }, (error: any, val: any) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(val);
                });
            });
        });
    }

    // delete file
    public deleteFile(fileName: string = ''): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        // Create the parameters for calling createBucket
        const bucketParams = {
            Bucket: aws_setup.AWS_BUCKET,
            Key: fileName,
        };

        return new Promise((resolve, reject) => {
            return s3.deleteObject(bucketParams, (err: any, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    // Image resize
    public resizeImage(imgName: string = '', imgPath: string = '', widthString: string = '', heightString: string = ''): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        // Create the parameters for calling createBucket
        const getParams = {
            Bucket: aws_setup.AWS_BUCKET, // your bucket name,
            Key: imgPath + imgName, // path to the object you're looking for
        };
        return new Promise((resolve, reject) => {
            s3.getObject(getParams, (err: any, data: any) => {
                if (err) {
                    return reject(err);
                }
                if (data) {
                    const gm = require('gm').subClass({ imageMagick: true });
                    return gm(data.Body)
                        .resize(widthString, heightString)
                        .toBuffer((error: any, buffer: any) => {
                            if (error) {
                                throw error;
                            } else {
                                return resolve(buffer);
                            }
                        });
                } else {
                    return resolve(false);
                }
            });
        });
    }

    // Image resize
    public resizeImageBase64(imgName: string = '', imgPath: string = '', widthString: string = '', heightString: string = ''): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        const ext = imgName.split('.');
        const imagePrefix = 'data:image/' + ext[1] + ';base64,';
        // Create the parameters for calling createBucket
        const getParams = {
            Bucket: aws_setup.AWS_BUCKET, // your bucket name,
            Key: imgPath + imgName, // path to the object you're looking for
        };
        return new Promise((resolve, reject) => {
            s3.getObject(getParams, (err: any, data: any) => {
                if (err) {
                    return reject(err);
                }
                if (data) {
                    const gm = require('gm').subClass({ imageMagick: true });
                    return gm(data.Body)
                        .resize(widthString, heightString)
                        .toBuffer((error: any, buffer: any) => {
                            if (error) {
                                throw error;
                            } else {
                                resolve(imagePrefix + buffer.toString('base64'));
                            }
                        });
                } else {
                    return resolve(false);
                }
            });
        });
    }

    public imageUpload(folderName: string = '', base64Image: any, imageType: string): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        const params = {
            Bucket: aws_setup.AWS_BUCKET,
            Key: folderName, // type is not required
            Body: base64Image,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: `image/${imageType}`,
        };

        return new Promise((resolve, reject) => {
            return s3.upload(params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                const locationArray = data.Location.split('/');
                locationArray.pop();
                const locationPath = locationArray.join('/');
                return resolve({ path: locationPath });
            });
        });
    }

    // s3 signCloudFront
    public async s3signCloudFront(keyObject: any): Promise<any> {
        const cloudfrontDistributionDomain = 'https://' + process.env.AWS_CLOUDFRONT_PREFIX;
        const filePath = path.join(__dirname, '../../../pk-APKA2ETX3SHA62PN6BX4.pem'); // Construct an absolute file path
        const readfile = fs.readFileSync(filePath, { encoding: 'utf8' });
        const url = `${cloudfrontDistributionDomain}/${keyObject}`;
        const privateKey = readfile;
        const keyPairId = process.env.CLOUFRONT_KEY_PAIR_ID;
        const signedUrl = getSignedUrl({
            url,
            keyPairId,
            dateLessThan: '2100-12-31',
            privateKey
        });

        return signedUrl;
    }

    // search folder
    public getFolder(folderName: string = ''): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        // Create the parameters for calling createBucket
        const bucketParams = {
            Bucket: aws_setup.AWS_BUCKET,
            Prefix: folderName,
            Delimiter: '/',
        };

        return new Promise((resolve, reject) => {
            return s3.listObjects(bucketParams, (err: any, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    public fileUpload(folderName: string = '', base64Data: any, imageType: string): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        const params = {
            Bucket: aws_setup.AWS_BUCKET,
            Key: folderName, // type is not required
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: imageType,
        };

        return new Promise((resolve, reject) => {
            return s3.upload(params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                const locationArray = data.Location.split('/');
                locationArray.pop();
                const locationPath = locationArray.join('/');
                return resolve({ path: locationPath });
            });
        });
    }

    public fileDownload(folderName: string = '', dataFile: any): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        const params = {
            Bucket: aws_setup.AWS_BUCKET,
            Key: folderName + dataFile, // type is not required
        };
        return new Promise((resolve, reject) => {
            s3.getObject(params, (err, data: any) => {
                if (err) {
                    return reject(err);
                }
                fs.writeFileSync(dataFile, data.Body);
                return resolve(dataFile);
            });
        });
    }

    public getSignedUrl(folderName: string = '', expiresSeconds: number = DEFAULT_ASSET_CONFIG_VALUE.S3_SIGN_EXPIRING_SEC): Promise<any> {
        AWS.config.update({ accessKeyId: aws_setup.AWS_ACCESS_KEY_ID, secretAccessKey: aws_setup.AWS_SECRET_ACCESS_KEY });
        const params = {
            Bucket: aws_setup.AWS_BUCKET,
            Key: folderName,
            Expires: expiresSeconds
        };

        return new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', params, (err, data: any) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }
    public getS3Object(keyObject: any): Promise<any> {
        return new Promise((resolve, reject) => {
            AWS.config.update({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_DEFAULT_REGION,
                signatureVersion: 'v4'
            });
            const s3Config = new AWS.S3();
            const myBucket = process.env.AWS_BUCKET;
            const myKey = keyObject;
            let signedUrlExpireSeconds = DEFAULT_ASSET_CONFIG_VALUE.EXPIRE_MINUTE;
            this.configService.getConfig(ASSET_CONFIG_NAME.EXPIRE_MINUTE).then((data) => {

                if (data && data.value) {
                    try {
                        if (typeof data.value === 'number') {
                            signedUrlExpireSeconds = data.value;
                        } else if (typeof data.value === 'string') {
                            signedUrlExpireSeconds = parseFloat(data.value);
                        }
                    } catch (error) {
                        console.log(ASSET_CONFIG_NAME.EXPIRE_MINUTE + ' value was wrong.');
                    }
                }
            });
            const url = s3Config.getSignedUrl('getObject', {
                Bucket: myBucket,
                Key: myKey,
                Expires: signedUrlExpireSeconds
            });
            return resolve(url);
        });
    }
    // aws cli v3 signed s3 url
    /* 
    public getS3Object(keyObject: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const s3Param = new AWS.S3(
                {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_DEFAULT_REGION,
                    signatureVersion: 'v4'
                }
            );
            const myBucket = process.env.AWS_BUCKET;
            const myKey = keyObject;
            let expireSecond = DEFAULT_ASSET_CONFIG_VALUE.EXPIRE_MINUTE;
            this.configService.getConfig(ASSET_CONFIG_NAME.EXPIRE_MINUTE).then((data) => {
                
                if (data && data.value) {
                    try {
                        if (typeof data.value === 'number') {
                            expireSecond = data.value;
                        } else if (typeof data.value === 'string') {
                            expireSecond = parseFloat(data.value);
                        }
                    } catch (error) {
                        console.log(ASSET_CONFIG_NAME.EXPIRE_MINUTE + ' value was wrong.');
                    }
                }
            });

            const params = { Bucket: myBucket, Key: myKey, Expires: expireSecond };
            s3Param.getSignedUrl('getObject', params, (error, url) => {
                if (error) {
                    console.error('Error generating Presigned URL:', error);
                    return reject(error);
                }
                return resolve(url);
            });
        });
    }
    */
    public async getConfigedSignedUrl(folderName: string = ''): Promise<string> {
        const signExpireConfig = await this.configService.getConfig(ASSET_CONFIG_NAME.EXPIRE_MINUTE);
        let expireSecond = DEFAULT_ASSET_CONFIG_VALUE.EXPIRE_MINUTE;

        if (signExpireConfig && signExpireConfig.value) {
            try {
                if (typeof signExpireConfig.value === 'number') {
                    expireSecond = signExpireConfig.value;
                } else if (typeof signExpireConfig.value === 'string') {
                    expireSecond = parseFloat(signExpireConfig.value);
                }
            } catch (error) {
                console.log(ASSET_CONFIG_NAME.EXPIRE_MINUTE + ' value was wrong.');
            }
        }

        let signURL = undefined;
        try {
            signURL = await this.getSignedUrl(folderName, expireSecond);
        } catch (error) {
            console.log(error);
        }
        if (signURL !== undefined) {
            for (const prefix of this.getPrefixBucketURL()) {
                signURL = signURL.replace(prefix, aws_setup.AWS_CLOUDFRONT_PREFIX);
            }
        }

        return signURL;
    }

    public getPrefixBucketURL(): string[] {
        const prefixArray = [];
        prefixArray.push('https://s3.amazonaws.com' + '/' + aws_setup.AWS_BUCKET);
        prefixArray.push('https://s3.' + aws_setup.AWS_DEFAULT_REGION + '.amazonaws.com' + '/' + aws_setup.AWS_BUCKET);

        return prefixArray;
    }
}
