var url = document.location; //ตรวจสอบว่าผู้ใช้ต้องการเรียกเข้าสู่โดเมนไหน
if ((url == "http://newconsen.io:4200") || (url == "http://newconsen.io:4200/")) {
    window.location = "https://newconsen.io:4200/";
} else if ((url == "newconsen.io:4200") || (url == "newconsen.io:4200/")) {
    window.location = "https://newconsen.io:4200/";
}