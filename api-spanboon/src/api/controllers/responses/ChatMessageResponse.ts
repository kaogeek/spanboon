/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { ChatMessage } from '../../models/ChatMessage';

export class ChatMessageResponse {
    public chatMessage: ChatMessage;
    public senderName: string;
    public senderType: string;
    public senderImage: string;
    public senderIsRead: boolean;
}