// app/api/login/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  let connection;
  try {
    const { email, password } = await request.json();

    // 1. สร้างการเชื่อมต่อ (Config สำหรับ TiDB Cloud โดยเฉพาะ)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true 
      }
    });

    // 2. Query ข้อมูล
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // 3. เช็คว่ามี user นี้ไหม
    if (rows.length === 0) {
      // ------------------------------------------------------------------
      // แก้ตรงนี้: เปลี่ยนจาก status: 401 เป็น status: 404
      // เพื่อให้ Frontend แยกแยะได้ว่า "ไม่พบ user" (จะได้เด้งไปหน้า Register)
      // ------------------------------------------------------------------
      return NextResponse.json({ success: false, message: "ไม่พบอีเมลนี้ในระบบ" }, { status: 404 }); 
    }

    const user = rows[0];

    // 4. เช็ครหัสผ่าน 
    if (password === user.password) {
      return NextResponse.json({ 
        success: true, 
        message: "เข้าสู่ระบบสำเร็จ!",
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email 
        } 
      }, { status: 200 });
    } else {
      // รหัสผิดยังคงใช้ 401 เหมือนเดิม ถูกแล้วครับ
      return NextResponse.json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}