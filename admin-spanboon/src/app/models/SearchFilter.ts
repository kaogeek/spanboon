/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

export class SearchFilter {
  public limit: number;
  public offset: number;
  public select: any[];
  public relation: any[];
  public whereConditions: any;
  public orderBy: any;
  public count: boolean;
  public keyword: string;
}
