/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import * as badwords from '../json/badwords.json'; // this will not error when compile if adding tsconfig.json "resolveJsonModule": true

export class BadWordUtils {

  private static badWordList: any[] = badwords.list;

  private static fix: string = "#@#";
  private static space: string = "&nbsp;";
  private static spaceReg: string = "@@@";

  public static clean(text: string): string {
    if(text === undefined || text === null || text === ''){
      return text;
    }

    // for (let n = 0; n < this.badWordList.length; n++) {
    //   const pattern = new RegExp(this.badWordList[n], "gi");
    //   text = text.replace(pattern, "*");
    // }

    text = text.trim();

    const patterns = new RegExp(this.space, "gi");
    text = text.replace(patterns, this.spaceReg);

    for (let n = 0; n < this.badWordList.length; n++) {

        let badTxt: string = Object.keys(this.badWordList[n])[0];
    
        if (this.badWordList[n][badTxt] !== undefined && this.badWordList[n][badTxt].length > 0) {
            let fixPosition: string = "";
            
            [...this.badWordList[n][badTxt]].forEach(c => {
                fixPosition += this.fix;
                text = text.replace(c, fixPosition);
            });
        }

        let firstTxt: string = badTxt.charAt(0);
        let lastTxt = badTxt.charAt(badTxt.length - 1);
    
        let txt: string = "";
        let midCount: number = 0;

        if(badTxt.length > 2) {
            [...badTxt].forEach((c, i) => {
                if (i > 0 && i < badTxt.length - 1) {
                    txt += c + "";
                    midCount++;
                } 
            });
        }
    
        let midTxt: string = txt === undefined ? '' : txt.substring(0, txt.length);
        
        let regTxt = "[" + firstTxt + "][\s*\.*]*(" + midTxt + "){"+midCount+"}[\s*\.*]*[" + lastTxt + "]"

        const pattern = new RegExp(regTxt, "gi");
        text = text.replace(pattern, "*");

        if (this.badWordList[n][badTxt] !== undefined && this.badWordList[n][badTxt].length > 0) {
            let fixPosition: string = "";

            [...this.badWordList[n][badTxt]].forEach(c => {
                fixPosition += this.fix;
                text = text.replace(fixPosition, c);
            });
        }
    }

    const patternss = new RegExp(this.spaceReg, "gi");
    text = text.replace(patternss, this.space);

    return text;
  }

}
