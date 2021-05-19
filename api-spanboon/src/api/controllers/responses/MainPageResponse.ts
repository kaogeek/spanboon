/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { TEMPLATE_TYPE } from '../../../constants/TemplateType';

export default {
    data(): any {
        return {
            emergencyEvents: {
                id: '12312456',
                title: 'เหตุการณ์ด่วน',
                subtitle: 'กำลังมองหา',
                description: '',
                link: '',
                contentCount: 35709512684,
                contents: [
                    {
                        id: '1859514',
                        title: '#บริจาค',
                        subtitle: 'ดูแลปู่ย่า',
                        description: 'วอนช่วยเหลือ "น้องปั๊ม" เด็กกตัญญูวัย 14 ต้องออกจากโรงเรียน มาคอยดูแลปู่ย่า พิการ-ป่วยติดเตียง เผย ตอนแรกอยากเป็นช่างซ่อมรถ จะได้อยู่ใกล้ปู่ย่า แต่มีคนแนะนำให้เรียนสูงๆ จะได้มั่นคง',
                        coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEbcjGDbqgywmXu6bBMOWbGVQ1pfbzCYopy0VtfufMVxhns5JOV.webp',
                        owner: 'Teng',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        updatedDate: '2020-05-01 10:36:22'
                    },
                    {
                        id: '1860081',
                        title: '#หน้ากากอนามัย',
                        subtitle: 'ห้ามนักเรียนใส่หน้ากากอนามัยมีลวดลาย',
                        description: 'รมว.ศธ. แจงกรณีโรงเรียนแห่งหนึ่งออกกฎห้ามนักเรียนใส่หน้ากากอนามัยมีลวดลาย ยันไม่มีนโยบายดังกล่าว แต่ขอให้คำนึงถึงความปลอดภัยป้อง "โควิด-19"',
                        coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh0OfqErZ6z7Gn8zoZqYS847xT3Gbm8T5nkYeQKHxpgLO4ZjV7.webp',
                        owner: 'Ploy',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        updatedDate: '2020-05-05 19:02:12'
                    },
                    {
                        id: '1863159',
                        title: '#เหยียดผิว',
                        subtitle: 'ความเท่าเทียมทางเชื้อชาติ',
                        description: 'กูเกิล แอมะซอน เฟซบุ๊ก ทวิตเตอร์ และบริษัทเทคโนโลยีอีกหลายแห่ง แสดงจุดยืนเรื่องความเท่าเทียมทางเชื้อชาติ พร้อมบริจาคเงินช่วยองค์กรการกุศลต่อต้านการเหยียดสีผิว',
                        coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3i8dzAvUqpG7a1EnSgJblAhwaTgSOsyu2wde1MnCoc5NPq1U.webp',
                        owner: 'Shiorin',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        updatedDate: '2020-05-10 19:02:12'
                    },
                    {
                        id: '8155830',
                        title: '#ภาษีมูลค่าเพิ่ม',
                        subtitle: 'เน็ตฟลิกซ์-ยูทูบเข้าข่ายจ่ายแวต',
                        description: 'น.ส.รัชดา ธนาดิเรก รองโฆษกประจำสำนักนายกรัฐมนตรี เปิดเผยว่า ที่ประชุม ครม.เห็นชอบให้มีการจัดเก็บภาษีมูลค่าเพิ่ม (แวต) กรณีการให้บริการทางอิเล็กทรอนิกส์จากต่างประเทศ หรือ อี-เซอร์วิส ทั้งการโหลดภาพยนตร์ เพลง หรือการจองโรงแรมที่พัก ซึ่งผู้ให้บริการอยู่ในต่างประเทศและไม่มีการจดทะเบียนหรือตั้งบริษัทลูกในประเทศไทย โดยออกเป็นร่างพระราชบัญญัติ (พ.ร.บ.) แก้ไขเพิ่มเติมประมวลรัษฎากร ซึ่งขั้นตอนหลังจากนี้ รัฐบาลจะนำส่งร่างฉบับดังกล่าวให้กับสภาผู้แทนราษฎรตามขั้นตอน และเมื่อกฎหมายมีผลบังคับใช้แล้ว จะทำให้รัฐเก็บภาษีได้เพิ่มขึ้นอีก 3,000 ล้านบาท',
                        coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEhwCsDHY2C2wxvTjPuPKaJfDP8T4yts9DsLtjVY3Qo6jjJ6CUK.webp',
                        owner: 'Warayut',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        updatedDate: '2020-05-15 08:53:22'
                    },
                    {
                        id: '4567869782',
                        title: '#อุุ้มวันเฉลิม',
                        subtitle: 'ปกป้องประชาชน',
                        description: '"ธนาธร" ผิดหวัง อ้างรัฐบาลไม่ติดตามคืบหน้ากรณี "วันเฉลิม" ถูกอุ้มในพนมเปญ กลับจับนักศึกษาผูกริบบิ้น ลั่น กฎหมายต้องใช้ปกป้องประชาชนผู้ถูกรังแก',
                        coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEhxcxL9sMaFiTUol4vGmFGsq3jDRUXKZCPwsKQEGteo5hIFG5T.webp',
                        owner: 'Teng',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        updatedDate: '2020-05-20 10:22:22'
                    },
                    {
                        id: '1865321',
                        title: '#เคอร์ฟิว',
                        subtitle: 'ยกเลิกเคอร์ฟิว',
                        description: 'นายวิษณุ เครืองาม รองนายกรัฐมนตรี ชี้ ยกเลิกเคอร์ฟิว ฟังกฎหมายอย่างเดียวไม่ได้ ต้องฟังคณะแพทย์ด้วย ยก ในบรรดากฎหมายพิเศษ พ.ร.ก.ฉุกเฉิน เหมาะสุดกับการป้องกันโควิด-19',
                        coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEhxb73zZBrMkmtdZItt53lNDaob3MALfhKo25rMgh0MEx3CQfg.webp',
                        owner: 'Shiorin',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        updatedDate: '2020-05-25 14:41:22'
                    }
                ],
                iconUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
            },
            lastest: {
                id: '12312456',
                title: 'กำลังมองหาล่าสุด',
                subtitle: 'กำลังมองหา',
                description: '',
                link: 'https://www.sanook.com/news/8155830/',
                updateDateTime: '2020-05-30 09:09:09',
                contents: [
                    {
                        id: '8155830',
                        title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                        subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                        description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                        iconUrl: '',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        link: 'https://www.sanook.com/news/8155830/',
                        updateDateTime: '2020-05-01 09:09:09',
                        fulfillUsers: [
                            {
                                firstName: 'Shiorin',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Ploy',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            }
                        ],
                        fulfillUserCount: 15907532486,
                        followUserCount: 1234567890,
                        followUsers: [
                            {
                                firstName: 'Shiorin',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Ploy',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'New',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Nut',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'koZec',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Teeratyuth',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Bank',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Bam',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Teng',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Chompoo',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            }
                        ],
                        post: {
                            title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                            detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                            pinned: false,
                            deleted: false,
                            hidden: false,
                            ownerUser: 'Shiorin',
                            referencePost: '12345'
                        }
                    }
                ],
                iconUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
            },
            hots: [
                {
                    id: '54321',
                    title: 'ยังมองหาอยู่',
                    subtitle: 'กำลังมองหา',
                    description: '',
                    link: '',
                    contents: [
                        {
                            id: '8155830',
                            title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                            subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                            description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-05-01 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: 'กกต.จำลองหน่วยลต.ลำปาง',
                            subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                            description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-05-05 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '8155830',
                            title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                            subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                            description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-05-10 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: 'กกต.จำลองหน่วยลต.ลำปาง',
                            subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                            description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-05-15 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        }
                    ],
                    iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                    contentCount: 14789630258
                }
            ],
            viewSection: {
                id: '54321',
                title: 'เรื่องราวที่คุณอาจพลาดไป',
                subtitle: 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ',
                description: '',
                link: '',
                contentCount: 14789630258,
                contents: [
                    {
                        id: '8155830',
                        title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                        subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                        description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                        iconUrl: '',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        link: 'https://www.sanook.com/news/8155830/',
                        owner: 'Warayut',
                        updateDateTime: '2020-05-01 09:09:09',
                        fulfillUsers: [
                            {
                                firstName: 'Shiorin'
                            },
                            {
                                firstName: 'Ploy'
                            },
                            {
                                firstName: 'New'
                            },
                            {
                                firstName: 'Nut'
                            },
                            {
                                firstName: 'koZec'
                            },
                            {
                                firstName: 'Teeratyuth'
                            },
                            {
                                firstName: 'Bank'
                            },
                            {
                                firstName: 'Bam'
                            },
                            {
                                firstName: 'Teng'
                            },
                            {
                                firstName: 'Chompoo'
                            }
                        ],
                        fulfillUserCount: 15907532486,
                        followUserCount: 1234567890,
                        followUsers: [
                            {
                                firstName: 'Shiorin',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Ploy',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'New',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Nut',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'koZec',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Teeratyuth',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Bank',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Bam',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Teng',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Chompoo',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            }
                        ],
                        post: {
                            title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                            detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                            pinned: false,
                            deleted: false,
                            hidden: false,
                            ownerUser: 'Shiorin',
                            referencePost: '12345'
                        }
                    },
                    {
                        id: '4567869782',
                        title: 'กกต.จำลองหน่วยลต.ลำปาง',
                        subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                        description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                        iconUrl: '',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        link: 'https://www.dailynews.co.th/politics/775404',
                        owner: 'Warayut',
                        updateDateTime: '2020-05-05 09:09:09',
                        fulfillUsers: [
                            {
                                firstName: 'Shiorin'
                            },
                            {
                                firstName: 'Ploy'
                            },
                            {
                                firstName: 'New'
                            },
                            {
                                firstName: 'Nut'
                            },
                            {
                                firstName: 'koZec'
                            },
                            {
                                firstName: 'Teeratyuth'
                            },
                            {
                                firstName: 'Bank'
                            },
                            {
                                firstName: 'Bam'
                            },
                            {
                                firstName: 'Teng'
                            },
                            {
                                firstName: 'Chompoo'
                            }
                        ],
                        fulfillUserCount: 15907532486,
                        followUserCount: 1234567890,
                        followUsers: [
                            {
                                firstName: 'Shiorin',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Ploy',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'New',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Nut',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'koZec',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Teeratyuth',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Bank',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Bam',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Teng',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Chompoo',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            }
                        ],
                        post: {
                            title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                            detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                            pinned: false,
                            deleted: false,
                            hidden: false,
                            ownerUser: 'Shiorin',
                            referencePost: '12345'
                        }
                    },
                    {
                        id: '8155830',
                        title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                        subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                        description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                        iconUrl: '',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        link: 'https://www.sanook.com/news/8155830/',
                        owner: 'Warayut',
                        updateDateTime: '2020-05-10 09:09:09',
                        fulfillUsers: [
                            {
                                firstName: 'Shiorin'
                            },
                            {
                                firstName: 'Ploy'
                            },
                            {
                                firstName: 'New'
                            },
                            {
                                firstName: 'Nut'
                            },
                            {
                                firstName: 'koZec'
                            },
                            {
                                firstName: 'Teeratyuth'
                            },
                            {
                                firstName: 'Bank'
                            },
                            {
                                firstName: 'Bam'
                            },
                            {
                                firstName: 'Teng'
                            },
                            {
                                firstName: 'Chompoo'
                            }
                        ],
                        fulfillUserCount: 15907532486,
                        followUserCount: 1234567890,
                        followUsers: [
                            {
                                firstName: 'Shiorin',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Ploy',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'New',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Nut',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'koZec',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Teeratyuth',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Bank',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Bam',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Teng',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Chompoo',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            }
                        ],
                        post: {
                            title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                            detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                            pinned: false,
                            deleted: false,
                            hidden: false,
                            ownerUser: 'Shiorin',
                            referencePost: '12345'
                        }
                    },
                    {
                        id: '4567869782',
                        title: 'กกต.จำลองหน่วยลต.ลำปาง',
                        subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                        description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                        iconUrl: '',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        link: 'https://www.dailynews.co.th/politics/775404',
                        owner: 'Warayut',
                        updateDateTime: '2020-05-15 09:09:09',
                        fulfillUsers: [
                            {
                                firstName: 'Shiorin'
                            },
                            {
                                firstName: 'Ploy'
                            },
                            {
                                firstName: 'New'
                            },
                            {
                                firstName: 'Nut'
                            },
                            {
                                firstName: 'koZec'
                            },
                            {
                                firstName: 'Teeratyuth'
                            },
                            {
                                firstName: 'Bank'
                            },
                            {
                                firstName: 'Bam'
                            },
                            {
                                firstName: 'Teng'
                            },
                            {
                                firstName: 'Chompoo'
                            }
                        ],
                        fulfillUserCount: 15907532486,
                        followUserCount: 1234567890,
                        followUsers: [
                            {
                                firstName: 'Shiorin',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Ploy',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'New',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Nut',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'koZec',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Teeratyuth',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Bank',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Bam',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            },
                            {
                                firstName: 'Teng',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                            },
                            {
                                firstName: 'Chompoo',
                                avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                            }
                        ],
                        post: {
                            title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                            detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                            pinned: false,
                            deleted: false,
                            hidden: false,
                            ownerUser: 'Shiorin',
                            referencePost: '12345'
                        }
                    }
                ],
                iconUrl: 'https://moveforwardparty.org/assets/logo-1.png'
            },
            emergencyPin: {
                id: '1857626',
                title: 'ไฟไหม้โกดังสินค้าญี่ปุ่นมือสองย่านบางใหญ่',
                subtitle: '',
                description: '02.30น. เกิดไฟไหม้โกดังเก็บสินค้าญี่ปุ่นมือสองใน อ.บางใหญ่ ทำให้ต้องระดมรถดับเพลิงกว่า 10 คันจากอำเภอข้างเคียงมาช่วยกันดับ',
                contents: [
                    {
                        id: '1859514',
                        title: '#ไฟไหม้',
                        description: 'เมื่อเวลา 02.30น. วันที่ 31 พ.ค. 2563 พ.ต.ท.อายุ เบ็นอับดุลเลาะ สว.(สอบสวน) สภ.บางใหญ่ จ.นนทบุรี รับแจ้งเหตุไฟไหม้โกดังเก็บสินค้ามือสอง ซอยวัดอินทร์ ต.เสาธงหิน อ.บางใหญ่ จ.นนทบุรี หลังรับแจ้งจึงประสานรถดับเพลิงจากเทศบาลบางม่วง เทศบาลบางเลน เทศบาลเสาเสาธงหิน และ อบต.บางรักพัฒนา จำนวนกว่า 10 คัน เพื่อฉีดน้ำป้องกันเพลิงไม่ให้ลุกลามไปยังบ้านเรือนประชาชนที่อยู่ติดกัน',
                        coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEbs1zse4XKEKf4c0f5TktliDZUXVQCY5jXxfxJtyk2IC2i6Djl.webp',
                        owner: 'Ploy',
                        postCount: 9,
                        commentCount: 22,
                        twitterCount: 456,
                        facebookCount: 3278,
                        likeCount: 45328,
                        shareCount: 704254,
                        viewCount: 6487930,
                        rePostCount: 74593564,
                        updatedDate: '2020-05-20 06:30:22'
                    }
                ]
            },
            sectionModels: [
                {
                    id: '54321',
                    title: 'สิ่งที่ "บ้านนี้มีรัก" กำลังมองหา',
                    subtitle: 'กำลังมองหาอยู่ 5 โพสที่รอการเติมเต็ม',
                    description: '',
                    link: '',
                    iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                    contentCount: 14789630258,
                    templateType: TEMPLATE_TYPE.MULTIPLE,
                    contents: [
                        {
                            id: '8155830',
                            title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                            subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                            description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-01 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: 'กกต.จำลองหน่วยลต.ลำปาง',
                            subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                            description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-05 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '8155830',
                            title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                            subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                            description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-10 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: 'กกต.จำลองหน่วยลต.ลำปาง',
                            subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                            description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                            iconUrl: '',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-02 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        }
                    ]
                },
                {
                    id: '',
                    title: '',
                    subtitle: '',
                    description: '',
                    link: '',
                    iconUrl: '',
                    contentCount: 14789630258,
                    templateType: TEMPLATE_TYPE.TWIN,
                    contents: [
                        {
                            id: '54321',
                            title: 'เพราะคุณติดตาม "เท้ง"',
                            subtitle: 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ',
                            description: '',
                            link: '',
                            iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                            contentCount: 14789630258,
                            templateType: TEMPLATE_TYPE.TWIN,
                            contents: [
                                {
                                    id: '8155830',
                                    title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                                    subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                                    description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                                    iconUrl: '',
                                    coverPageUrl: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEbcjGDbqgywmXu6bBMOWbGVQ1pfbzCYopy0VtfufMVxhns5JOV.webp',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.sanook.com/news/8155830/',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-05-15 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                },
                                {
                                    id: '4567869782',
                                    title: 'กกต.จำลองหน่วยลต.ลำปาง',
                                    subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                                    description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                                    iconUrl: '',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.dailynews.co.th/politics/775404',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-05-15 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                },
                            ]
                        },
                        {
                            id: '54321',
                            title: 'เพราะคุณติดตาม "ธนาธร"',
                            subtitle: 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ',
                            description: '',
                            link: '',
                            iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                            contentCount: 14789630258,
                            templateType: TEMPLATE_TYPE.TWIN,
                            contents: [
                                {
                                    id: '8155830',
                                    title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                                    subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                                    description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                                    iconUrl: '',
                                    coverPageUrl: 'https://s.isanook.com/ns/0/rp/r/w728/ya0xa0m1w0/aHR0cHM6Ly9zLmlzYW5vb2suY29tL25zLzAvdWQvMTYzMS84MTU1ODMwL3RoYWktYWlyd2F5cy1yZWhhYi1jYWJpbmV0LmpwZw==.jpg',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.sanook.com/news/8155830/',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-05-15 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                },
                                {
                                    id: '4567869782',
                                    title: 'กกต.จำลองหน่วยลต.ลำปาง',
                                    subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                                    description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                                    iconUrl: '',
                                    coverPageUrl: 'https://www.dailynews.co.th/admin/upload/20200519/news_VzItgCmluN172714_533.jpg?v=202006111211',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.dailynews.co.th/politics/775404',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-05-15 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: '54321',
                    title: 'สิ่งที่กำลังเกิดขึ้นรอบตัวคุณ',
                    subtitle: 'มีอีก 5 โพสต์ที่ บ้านนี้มีรัก กำลังมองหา',
                    description: '',
                    link: '',
                    iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                    contentCount: 14789630258,
                    templateType: TEMPLATE_TYPE.ICON,
                    contents: [
                        {
                            id: '8155830',
                            title: '#การบินไทย',
                            iconUrl: 'https://www.egov.go.th/upload/eservice-thumbnail/img_08b9fed11c50602c4dde1a7a45b6dc3e.png',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-04 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: '#กกต',
                            iconUrl: 'https://www.thairath.co.th/media/HCtHFA7ele6Q2dUK3zLXliOCGKwD7TT9NqdNb8aPMrWMnL7Qi4cIdvnh0jxkLgVwXz.webp',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-02 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '8155830',
                            title: '#การบินไทย',
                            iconUrl: 'https://www.egov.go.th/upload/eservice-thumbnail/img_08b9fed11c50602c4dde1a7a45b6dc3e.png',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-03 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1200,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: '#กกต',
                            iconUrl: 'https://www.thairath.co.th/media/HCtHFA7ele6Q2dUK3zLXliOCGKwD7TT9NqdNb8aPMrWMnL7Qi4cIdvnh0jxkLgVwXz.webp',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-06 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '8155830',
                            title: '#การบินไทย',
                            iconUrl: 'https://www.egov.go.th/upload/eservice-thumbnail/img_08b9fed11c50602c4dde1a7a45b6dc3e.png',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-04 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: '#กกต',
                            iconUrl: 'https://www.thairath.co.th/media/HCtHFA7ele6Q2dUK3zLXliOCGKwD7TT9NqdNb8aPMrWMnL7Qi4cIdvnh0jxkLgVwXz.webp',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-02 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '8155830',
                            title: '#การบินไทย',
                            iconUrl: 'https://www.egov.go.th/upload/eservice-thumbnail/img_08b9fed11c50602c4dde1a7a45b6dc3e.png',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.sanook.com/news/8155830/',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-03 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1200,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        },
                        {
                            id: '4567869782',
                            title: '#กกต',
                            iconUrl: 'https://www.thairath.co.th/media/HCtHFA7ele6Q2dUK3zLXliOCGKwD7TT9NqdNb8aPMrWMnL7Qi4cIdvnh0jxkLgVwXz.webp',
                            postCount: 9,
                            commentCount: 22,
                            twitterCount: 456,
                            facebookCount: 3278,
                            likeCount: 45328,
                            shareCount: 704254,
                            viewCount: 6487930,
                            rePostCount: 74593564,
                            link: 'https://www.dailynews.co.th/politics/775404',
                            owner: 'Warayut',
                            updateDateTime: '2020-06-06 09:09:09',
                            fulfillUsers: [
                                {
                                    firstName: 'Shiorin'
                                },
                                {
                                    firstName: 'Ploy'
                                },
                                {
                                    firstName: 'New'
                                },
                                {
                                    firstName: 'Nut'
                                },
                                {
                                    firstName: 'koZec'
                                },
                                {
                                    firstName: 'Teeratyuth'
                                },
                                {
                                    firstName: 'Bank'
                                },
                                {
                                    firstName: 'Bam'
                                },
                                {
                                    firstName: 'Teng'
                                },
                                {
                                    firstName: 'Chompoo'
                                }
                            ],
                            fulfillUserCount: 15907532486,
                            followUserCount: 1234567890,
                            followUsers: [
                                {
                                    firstName: 'Shiorin',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Ploy',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'New',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Nut',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'koZec',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Teeratyuth',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Bank',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Bam',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                },
                                {
                                    firstName: 'Teng',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                },
                                {
                                    firstName: 'Chompoo',
                                    avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                }
                            ],
                            post: {
                                title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                pinned: false,
                                deleted: false,
                                hidden: false,
                                ownerUser: 'Shiorin',
                                referencePost: '12345'
                            }
                        }
                    ]
                },
                {
                    id: '',
                    title: '',
                    subtitle: '',
                    description: '',
                    link: '',
                    iconUrl: '',
                    contentCount: 14789630258,
                    templateType: TEMPLATE_TYPE.TWIN,
                    contents: [
                        {
                            id: '54321',
                            title: 'สิ่งที่ "โรงเรียน" กำลังมองหา',
                            subtitle: 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ',
                            description: '',
                            link: '',
                            iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                            contentCount: 14789630258,
                            templateType: TEMPLATE_TYPE.TWIN,
                            contents: [
                                {
                                    id: '8155830',
                                    title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                                    subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                                    description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                                    iconUrl: '',
                                    coverPageUrl: 'https://s.isanook.com/ns/0/rp/r/w728/ya0xa0m1w0/aHR0cHM6Ly9zLmlzYW5vb2suY29tL25zLzAvdWQvMTYzMS84MTU1ODMwL3RoYWktYWlyd2F5cy1yZWhhYi1jYWJpbmV0LmpwZw==.jpg',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.sanook.com/news/8155830/',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-07 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                },
                                {
                                    id: '4567869782',
                                    title: 'กกต.จำลองหน่วยลต.ลำปาง',
                                    subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                                    description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                                    iconUrl: '',
                                    coverPageUrl: 'https://www.dailynews.co.th/admin/upload/20200519/news_VzItgCmluN172714_533.jpg?v=202006111211',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.dailynews.co.th/politics/775404',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-03 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                }
                            ]
                        },
                        {
                            id: '54321',
                            title: 'สิ่งที่ "คนไร้บ้าน" กำลังมองหา',
                            subtitle: 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ',
                            description: '',
                            link: '',
                            iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                            contentCount: 14789630258,
                            templateType: TEMPLATE_TYPE.TWIN,
                            contents: [
                                {
                                    id: '8155830',
                                    title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                                    subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                                    description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                                    iconUrl: '',
                                    coverPageUrl: 'https://s.isanook.com/ns/0/rp/r/w728/ya0xa0m1w0/aHR0cHM6Ly9zLmlzYW5vb2suY29tL25zLzAvdWQvMTYzMS84MTU1ODMwL3RoYWktYWlyd2F5cy1yZWhhYi1jYWJpbmV0LmpwZw==.jpg',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.sanook.com/news/8155830/',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-08 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                },
                                {
                                    id: '4567869782',
                                    title: 'กกต.จำลองหน่วยลต.ลำปาง',
                                    subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                                    description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                                    iconUrl: '',
                                    coverPageUrl: 'https://www.dailynews.co.th/admin/upload/20200519/news_VzItgCmluN172714_533.jpg?v=202006111211',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.dailynews.co.th/politics/775404',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-02 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    id: '',
                    title: '',
                    subtitle: '',
                    description: '',
                    link: '',
                    iconUrl: '',
                    contentCount: 14789630258,
                    templateType: TEMPLATE_TYPE.TWIN,
                    contents: [
                        {
                            id: '54321',
                            title: 'สิ่งที่ "เด็ก" กำลังมองหา',
                            subtitle: 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ',
                            description: '',
                            link: '',
                            iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                            contentCount: 14789630258,
                            templateType: TEMPLATE_TYPE.TWIN,
                            contents: [
                                {
                                    id: '8155830',
                                    title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                                    subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                                    description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                                    iconUrl: '',
                                    coverPageUrl: 'https://s.isanook.com/ns/0/rp/r/w728/ya0xa0m1w0/aHR0cHM6Ly9zLmlzYW5vb2suY29tL25zLzAvdWQvMTYzMS84MTU1ODMwL3RoYWktYWlyd2F5cy1yZWhhYi1jYWJpbmV0LmpwZw==.jpg',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.sanook.com/news/8155830/',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-05 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                },
                                {
                                    id: '4567869782',
                                    title: 'กกต.จำลองหน่วยลต.ลำปาง',
                                    subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                                    description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                                    iconUrl: '',
                                    coverPageUrl: 'https://www.dailynews.co.th/admin/upload/20200519/news_VzItgCmluN172714_533.jpg?v=202006111211',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.dailynews.co.th/politics/775404',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-10 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                }
                            ]
                        },
                        {
                            id: '54321',
                            title: 'สิ่งที่ "คนพิการ" กำลังมองหา',
                            subtitle: 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ',
                            description: '',
                            link: '',
                            iconUrl: 'https://moveforwardparty.org/assets/logo-1.png',
                            contentCount: 14789630258,
                            templateType: TEMPLATE_TYPE.TWIN,
                            contents: [
                                {
                                    id: '8155830',
                                    title: 'ครม.ไฟเขียว การบินไทย เข้าฟื้นฟูกิจการ',
                                    subtitle: 'คลังลดถือหุ้นเหลือต่ำ 50% พ้นสภาพรัฐวิสาหกิจ',
                                    description: 'แหล่งข่าวจากทำเนียบรัฐบาล เปิดเผยว่า วันนี้ (19 พ.ค.) ที่ประชุมคณะรัฐมนตรี (ครม.) เห็นชอบและอนุมัติตามที่คณะกรรมการนโยบายรัฐวิสาหกิจ (คนร.) เสนอให้บริษัท การบินไทย จำกัด (มหาชน) เข้าสู่กระบวนการฟื้นฟูกิจการ ภายใต้กฎหมายล้มละลาย ซึ่งจะต้องส่งเรื่องให้ศาลล้มละลายกลาง รวมทั้งเห็นชอบให้การบินไทยพ้นสภาพการเป็นรัฐวิสาหกิจ โดยให้กระทรวงการคลังลดสัดส่วนการถือหุ้นต่ำกว่า 50% จากปัจจุบันถืออยู่ 51%',
                                    iconUrl: '',
                                    coverPageUrl: 'https://s.isanook.com/ns/0/rp/r/w728/ya0xa0m1w0/aHR0cHM6Ly9zLmlzYW5vb2suY29tL25zLzAvdWQvMTYzMS84MTU1ODMwL3RoYWktYWlyd2F5cy1yZWhhYi1jYWJpbmV0LmpwZw==.jpg',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.sanook.com/news/8155830/',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-11 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                },
                                {
                                    id: '4567869782',
                                    title: 'กกต.จำลองหน่วยลต.ลำปาง',
                                    subtitle: 'ขอรบ.เลื่อนเคอร์ฟิวในพื้นที่',
                                    description: 'กกต.เตรียมจำลองหน่วยเลือกตั้งซ่อมลำปาง ดึงสธ.ให้คำแนะนำป้องกันโควิด พร้อมขอรัฐบาลออกข้อกำหนดเลื่อนเวลาเคอร์ฟิวในพื้นที่วันเลือกตั้ง',
                                    iconUrl: '',
                                    coverPageUrl: 'https://www.dailynews.co.th/admin/upload/20200519/news_VzItgCmluN172714_533.jpg?v=202006111211',
                                    postCount: 9,
                                    commentCount: 22,
                                    twitterCount: 456,
                                    facebookCount: 3278,
                                    likeCount: 45328,
                                    shareCount: 704254,
                                    viewCount: 6487930,
                                    rePostCount: 74593564,
                                    link: 'https://www.dailynews.co.th/politics/775404',
                                    owner: 'Warayut',
                                    updateDateTime: '2020-06-01 09:09:09',
                                    fulfillUsers: [
                                        {
                                            firstName: 'Shiorin'
                                        },
                                        {
                                            firstName: 'Ploy'
                                        },
                                        {
                                            firstName: 'New'
                                        },
                                        {
                                            firstName: 'Nut'
                                        },
                                        {
                                            firstName: 'koZec'
                                        },
                                        {
                                            firstName: 'Teeratyuth'
                                        },
                                        {
                                            firstName: 'Bank'
                                        },
                                        {
                                            firstName: 'Bam'
                                        },
                                        {
                                            firstName: 'Teng'
                                        },
                                        {
                                            firstName: 'Chompoo'
                                        }
                                    ],
                                    fulfillUserCount: 15907532486,
                                    followUserCount: 1234567890,
                                    followUsers: [
                                        {
                                            firstName: 'Shiorin',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Ploy',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'New',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Nut',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'koZec',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Teeratyuth',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Bank',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Bam',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        },
                                        {
                                            firstName: 'Teng',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZYjm3734zmx5Zb8vWZpKRMtylSeFe8oLbUggary8xG4KRnGmWthk.webp'
                                        },
                                        {
                                            firstName: 'Chompoo',
                                            avatar: 'https://www.thairath.co.th/media/dFQROr7oWzulq5FZUEh3g7CpCk5XJ7Ay0jnw3NCdpsoLLGhxLv9s8qNBYW9LoGN4ca5.webp'
                                        }
                                    ],
                                    post: {
                                        title: 'ณัฐพงษ์-ส.ส.ส้มหวาน แจ้งไม่ได้เดินทางไปร่วมสมัครสมาชิกพรรคก้าวไกล',
                                        detail: '14 มี.ค. 63 - นายณัฐพงษ์ เรืองปัญญาวุฒิ  ส.ส.กรุงเทพฯ อดีตพรรคอนาคตใหม่ โพสต์เฟซบุ๊กเมื่อคืนที่ผ่านมาว่า หลังจากพิจารณาอย่างรอบคอบร่วมกับเพื่อน ส.ส. บางท่านแล้ว เช้านี้ (14 มี.ค. 63) ผมคงไม่ได้เดินทางไปร่วมสมัครสมาชิก #พรรคก้าวไกล นะครับ',
                                        pinned: false,
                                        deleted: false,
                                        hidden: false,
                                        ownerUser: 'Shiorin',
                                        referencePost: '12345'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    },
};
