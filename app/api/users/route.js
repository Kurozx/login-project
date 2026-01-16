import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// 1. READ: ดึงข้อมูลทั้งหมด
export async function GET() {
  try {
    const query = 'SELECT * FROM users ORDER BY id DESC';
    const [rows] = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. CREATE: สร้างข้อมูลใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // ตรวจสอบค่าว่าง
    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    await pool.query(query, [username, email, password]);

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}