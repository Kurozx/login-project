import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// 3. UPDATE: แก้ไขข้อมูลตาม ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { username, email, password } = body;

    let query, values;

    // เช็คว่ามีการส่งรหัสผ่านใหม่มาไหม
    if (password && password.trim() !== "") {
      // กรณีเปลี่ยนรหัสผ่านด้วย
      query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
      values = [username, email, password, id];
    } else {
      // กรณีไม่เปลี่ยนรหัสผ่าน (อัปเดตแค่ชื่อกับอีเมล)
      query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
      values = [username, email, id];
    }

    await pool.query(query, values);
    return NextResponse.json({ message: 'User updated successfully' });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE: ลบข้อมูลตาม ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const query = 'DELETE FROM users WHERE id = ?';
    await pool.query(query, [id]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}