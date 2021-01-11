/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

 export class ChatMessageRequest {

    public message: string;
    public asset: any; // pattern { data: base64, fileName: string, mimeType: string, size: number }
    public videoURL: string;
    public asPageId: string;
    public messageType: string;

}