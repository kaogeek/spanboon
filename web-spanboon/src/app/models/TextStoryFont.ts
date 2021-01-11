/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from './BaseModel';

export class TextStoryFont extends BaseModel {
  public id: string
  public value: any
  public htmlValue: any
  public htmlType: string
  public link: string
  public index: number
  public style: any
  public isNewTeb: any

  public imageUrl: string
  public image64: string
  public imageDetail: string

  public videoUrl: string
  public videoDetail: string

  public asset: any
}
