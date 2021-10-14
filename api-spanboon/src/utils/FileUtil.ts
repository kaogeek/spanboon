/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import moment from 'moment';

export class FileUtil {

    public static MIME_TYPE_MAPPING = {
        'audio/aac': '.aac',
        'application/x-abiword': '.abw',
        'application/x-freearc': '.arc',
        'video/x-msvideo': '.avi',
        'application/vnd.amazon.ebook': '.azw',
        'application/octet-stream': '.bin',
        'image/bmp': '.bmp',
        'application/x-bzip': '.bz',
        'application/x-bzip2': '.bz2',
        'application/x-cdf': '.cda',
        'application/x-csh': '.csh',
        'text/css': '.css',
        'text/csv': '.csv',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-fontobject': '.eot',
        'application/epub+zip': '.epub',
        'application/gzip': '.gz',
        'image/gif': '.gif',
        'text/html': '.html',
        'image/vnd.microsoft.icon': '.ico',
        'text/calendar': '.ics',
        'application/java-archive': '.jar',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'text/javascript': '.js',
        'application/json': '.json',
        'application/ld+json': '.jsonld',
        'audio/midi audio/x-midi': '.midi',
        'audio/mpeg': '.mp3',
        'video/mp4': '.mp4',
        'video/mpeg': '.mpeg',
        'application/vnd.apple.installer+xml': '.mpkg',
        'application/vnd.oasis.opendocument.presentation': '.odp',
        'application/vnd.oasis.opendocument.spreadsheet': '.ods',
        'application/vnd.oasis.opendocument.text': '.odt',
        'audio/ogg': '.oga',
        'video/ogg': '.ogv',
        'application/ogg': '.ogx',
        'audio/opus': '.opus',
        'font/otf': '.otf',
        'image/png': '.png',
        'application/pdf': '.pdf',
        'application/x-httpd-php': '.php',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'application/vnd.rar': '.rar',
        'application/rtf': '.rtf',
        'application/x-sh': '.sh',
        'image/svg+xml': '.svg',
        'application/x-shockwave-flash': '.swf',
        'application/x-tar': '.tar',
        'image/tiff': '.tiff',
        'video/mp2t': '.ts',
        'font/ttf': '.ttf',
        'text/plain': '.txt',
        'application/vnd.visio': '.vsd',
        'audio/wav': '.wav',
        'audio/webm': '.weba',
        'video/webm': '.webm',
        'image/webp': '.webp',
        'font/woff': '.woff',
        'font/woff2': '.woff2',
        'application/xhtml+xml': '.xhtml',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/xml': '.xml',
        'text/xml': '.xml',
        'application/vnd.mozilla.xul+xml': '.xul',
        'application/zip': '.zip',
        'video/3gpp': '.3gp',
        'audio/3gpp': '.3gp',
        'video/3gpp2': '.3g2',
        'audio/3gpp2': '.3g2',
        'application/x-7z-compressed': '.7z',
    };

    public static renameFile(): any {
        return Math.random().toString(36).substring(2, 15) + moment().format('x') + Math.random().toString(36).substring(2, 15);
    }

    public static appendFileType(fileName: string, mimeType: string): string {
        if (fileName === undefined || fileName === null || fileName === '') {
            return fileName;
        }

        if (mimeType === undefined || mimeType === null || mimeType === '') {
            return fileName;
        }

        if (this.MIME_TYPE_MAPPING[mimeType] !== undefined) {
            return fileName + this.MIME_TYPE_MAPPING[mimeType];
        }

        return fileName;
    }

    public static isFileNameHasExtension(fileName: string): boolean {
        const result = this.getFileNameExtension(fileName);
        if (result !== undefined && result !== '') {
            return true;
        }

        return false;
    }

    public static getFileNameExtension(fileName: string): string {
        if (fileName === undefined || fileName === null || fileName === '') {
            return undefined;
        }

        const result = (/[.]/.exec(fileName)) ? /[^.]+$/.exec(fileName) : undefined;

        return (result !== undefined && result.length > 0) ? result[0] : undefined;
    }

    public static getFileNameMimeType(fileName: string): string {
        if (fileName === undefined || fileName === null || fileName === '') {
            return undefined;
        }

        const fileExtenstion = this.getFileNameExtension(fileName);

        return this.getExtensionMimeType(fileExtenstion);
    }

    public static getExtensionMimeType(fileExtension: string): string {
        console.log('fileExtension', fileExtension);
        if (fileExtension === undefined || fileExtension === null || fileExtension === '') {
            return undefined;
        }

        for (const mimeType of Object.keys(this.MIME_TYPE_MAPPING)) {
            const value = this.MIME_TYPE_MAPPING[mimeType];

            if (fileExtension.indexOf('.') === 0) {
                if (value === fileExtension) {
                    return mimeType;
                }
            } else {
                if (value === '.' + fileExtension) {
                    return mimeType;
                }
            }
        }

        return undefined;
    }
}
