"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

export default function LoginPage() {
  const router = useRouter();
  const [inputs, setInputs] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // สีหลักของธีม (เขียวธรรมชาติ)
  const themeColor = '#198754'; 

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });

      const data = await res.json();

      // --- กรณีไม่พบ User (404) ---
      if (res.status === 404) {
        Swal.fire({
          title: 'ไม่พบผู้ใช้งาน',
          text: "ไม่พบอีเมลนี้ในระบบ! คุณต้องการสมัครสมาชิกใหม่หรือไม่?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: themeColor,
          cancelButtonColor: '#d33',
          confirmButtonText: 'สมัครสมาชิก',
          cancelButtonText: 'ลองใหม่อีกครั้ง'
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/register');
          }
        });
        setLoading(false);
        return;
      }

      // --- กรณี Login สำเร็จ ---
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));

        // แจ้งเตือนสำเร็จสวยๆ ก่อนย้ายหน้า
        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          text: 'กำลังพาคุณไปยังหน้าหลัก...',
          timer: 1500,
          showConfirmButton: false
        });

        router.push('/');
      } else {
        // --- กรณีรหัสผิด หรือ error อื่นๆ ---
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: data.message || 'รหัสผ่านไม่ถูกต้อง',
          confirmButtonColor: themeColor
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่',
        confirmButtonColor: themeColor
      });
    } finally {
      // เช็ค error state หรือเงื่อนไขอื่นๆ ก่อน set loading
      // แต่ในกรณีใช้ Swal เรา set false ได้เลยเพื่อให้ปุ่มกลับมาทำงาน
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center vh-100 w-100"
      style={{ 
        // พื้นหลังไล่เฉดสีเขียว ทันสมัย
        background: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
        fontFamily: "'Sarabun', sans-serif" // แนะนำให้ใช้ฟอนต์ไทยสวยๆ ถ้ามี
      }}
    >
      <div 
        className="card border-0 shadow-lg" 
        style={{ 
          maxWidth: '420px', 
          width: '90%', 
          borderRadius: '20px',
          overflow: 'hidden' // เพื่อให้ header ไม่ล้น border radius
        }}
      >
        {/* --- Header ส่วนบนของ Card --- */}
        <div className="text-center py-4 bg-white">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
              style={{ width: '70px', height: '70px', backgroundColor: '#e8f5e9' }}
            >
               <i className="bi bi-tree-fill fs-2" style={{ color: themeColor }}></i>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>ยินดีต้อนรับ</h3>
            <p className="text-muted small">เข้าสู่ระบบเพื่อเข้าสู่เว็บไซต์</p> 
            {/* ^ แก้ข้อความตรงนี้ให้ตรงกับระบบของคุณ */}
        </div>

        {/* --- Form Section --- */}
        <div className="card-body px-4 px-md-5 pb-5 pt-0 bg-white">
          <form onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">อีเมล</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-light" style={{ borderColor: '#ced4da' }}>
                  <i className="bi bi-envelope text-success"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control bg-light border-start-0 ps-0 shadow-none"
                  placeholder="กรอกอีเมล"
                  value={inputs.email}
                  onChange={handleChange}
                  required
                  style={{ borderLeft: 'none' }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label small fw-bold text-secondary">รหัสผ่าน</label>
              </div>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-light" style={{ borderColor: '#ced4da' }}>
                  <i className="bi bi-key text-success"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control bg-light border-start-0 ps-0 shadow-none"
                  placeholder="กรอกรหัสผ่าน"
                  value={inputs.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="text-end mt-1">
                 <a href="#" className="text-decoration-none small" style={{ color: themeColor }}>ลืมรหัสผ่าน?</a>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn w-100 py-2 rounded-pill fw-bold text-white shadow-sm mt-2"
              disabled={loading}
              style={{ 
                backgroundColor: themeColor, 
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  กำลังตรวจสอบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="small text-muted mb-0">
              ยังไม่มีบัญชีผู้ใช้งาน? <a href="/register" className="fw-bold text-decoration-none" style={{ color: themeColor }}>สมัครสมาชิก</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}