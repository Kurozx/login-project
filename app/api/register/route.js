// app/api/register/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  let connection;
  try {
    // 1. รับค่าที่ส่งมาจากหน้าบ้าน
    const body = await request.json();
    const { username, email, password } = body;

    // Log ดูใน Terminal เพื่อเช็คว่าข้อมูลส่งมาถึง Backend ไหม
    console.log("📝 กำลังสมัครสมาชิก: ", { username, email }); 

    // 2. ตรวจสอบว่าข้อมูลครบไหม
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // 3. เชื่อมต่อฐานข้อมูล TiDB
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true // TiDB Cloud บังคับใช้ SSL
      }
    });

    // 4. เช็คว่ามีอีเมลนี้หรือยัง
    const [existingUsers] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // 5. บันทึกข้อมูลลงฐานข้อมูล (Insert)
    await connection.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );

    console.log("✅ สมัครสมาชิกสำเร็จ:", username);

    return NextResponse.json({ success: true, message: "สมัครสมาชิกสำเร็จ!" }, { status: 201 });

  } catch (error) {
    // ถ้า Error ให้แสดงรายละเอียดใน Terminal ฝั่งคนเขียนโค้ด
    console.error("❌ Register Error:", error); 
    return NextResponse.json({ success: false, message: "Server Error: " + error.message }, { status: 500 });
  } finally {
    // ปิดการเชื่อมต่อเสมอ ไม่ว่าจะสำเร็จหรือไม่
    if (connection) await connection.end();
  }
}