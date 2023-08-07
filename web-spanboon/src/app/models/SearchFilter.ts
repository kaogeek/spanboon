/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

export class SearchFilter {
  public limit: number;
  public offset: number;
  public select: any[];
  public relation: any[];
  public whereConditions: any;
  public orderBy: any;
  public count: boolean;
  public keyword?: string;
}
