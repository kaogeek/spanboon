/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */
import { PLATFORM_FULFILL_TEXT } from '../custom/variable';

export enum MESSAGE {
     TEXT_TITLE = 'กรุณากรอก หัวข้อกระทู้',
     TEXT_TITLE_LOGIN = 'กรุณาเข้าสู่ระบบ',
     TEXT_LOGIN_SUCCESS = 'เข้าสู่ระบบสำเร็จ',
     TEXT_LOGIN_BANED = 'บัญชีผู้ใช้ถูกแบน',
     TEXT_CONTENT = 'กรุณากรอก เนื้อหากระทู้',
     TEXT_BUTTON_CONFIRM = 'ตกลง',
     TEXT_BUTTON_CANCEL = 'ยกเลิก',
     TEXT_SUCCESS = 'สร้างกระทู้ สำเร็จ',
     TEXT_ERROR = 'เกิดข้อผิดพลาด',
     TEXT_DELETE_CONTENT = 'ยืนยันการลบข้อมูล ?',
     TEXT_DEVERLOP = 'ระบบอยู่ในระหว่างการพัฒนา',
     TEXT_BUTTON_FULFILLMENT_CREATE = 'ไม่, เปิดคำขอเติมเต็มใหม่',
     TEXT_BUTTON_FULFILLMENT_EDIT = 'ใช่, เพิ่มเข้าคำขอเติมเต็มเดิม',
     TEXT_CONFIRM_FULFILL_CASE_EXISTS = 'คุณมีคำขอเติมเต็มเดิมที่เปิดไว้สำหรับโพสต์นี้อยู่แล้ว ต้องการเพิ่มรายการเหล่านี้เข้าคำขอเติมเต็มเดิมหรือไม่?',
     TEXT_CONFIRM_FULFILL_REQUEST = 'คุณต้องการยืนยันรายการเติมเต็มนี้ ?',
     TEXT_CANCEL_CONFIRM_FULFILL_REQUEST = 'คุณต้องการยกเลิกยืนยันคำขอเติมเต็มนี้ ?',
     TEXT_CANCEL_FULFILL_CASE = 'คุณต้องการยกเลิกคำขอเติมเต็มนี้ ?',
     TEXT_DELETE_FULFILL_REQUEST = 'คุณต้องการลบ',
     TEXT_DELETE_FULFILL_LIST = 'คุณต้องการยกเลิกรายการเติมเต็มทั้งหมด ?'
}
