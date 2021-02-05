import TwitterText from "twitter-text";

/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

export class TwitterUtils {
    public static getTwitterValidate(title: string, detail: string, link?: string, storyLink?: string, emerEventHashTag?: string, objectiveHashTag?: string): any {
        let tweet = this.generateTwitterText(title, detail, link, storyLink, emerEventHashTag, objectiveHashTag);
        tweet = TwitterText.parseTweet(tweet);

        return tweet;
    }

    public static generateTwitterText(title: string, detail: string, link?: string, storyLink?: string, emerEventHashTag?: string, objectiveHashTag?: string): string {
        let result = '';
        if (title !== undefined && title !== null && title !== '') {
            result += '[ ' + title + ' ]';
        }

        if (detail !== undefined && detail !== null && detail !== '') {
            if (result !== '') {
                result = result + '\n\n' + detail;
            } else {
                result += detail;
            }
        }

        if (link !== undefined && link !== null && link !== '') {
            if (result !== '') {
                result = result + '\n\n' + ('อ่านต่อ: ' + link);
            } else {
                result += ('อ่านต่อ: ' + link);
            }
        }

        if (storyLink !== undefined && storyLink !== null && storyLink !== '') {
            if (result !== '') {
                result = result + '\n\n' + ('อ่านสตอรี่: ' + storyLink);
            } else {
                result += ('อ่านสตอรี่: ' + storyLink);
            }
        }

        let hashTagLine = '';
        if (emerEventHashTag !== undefined && emerEventHashTag !== null && emerEventHashTag !== '') {
            hashTagLine += '#' + emerEventHashTag;
        }

        if (objectiveHashTag !== undefined && objectiveHashTag !== null && objectiveHashTag !== '') {
            if (hashTagLine !== '') {
                hashTagLine = hashTagLine + ' ' + ('#' + objectiveHashTag);
            } else {
                hashTagLine += ('#' + objectiveHashTag);
            }
        }

        if (hashTagLine !== '') {
            if (result !== '') {
                result = result + '\n\n' + hashTagLine;
            } else {
                result += hashTagLine;
            }
        }

        return result;
    }
}