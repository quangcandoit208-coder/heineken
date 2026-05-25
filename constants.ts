
import { AppSettings } from './types';

export const CITIES = ['An Giang', 'BRVT', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Cần Thơ', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'TP.HCM', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Lâm Đồng', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'];
export const BRANDS = ['Heineken', 'Tiger', 'Bia Việt', 'Bivina', 'Larue', 'Strongbow', 'Edelweiss'];
// Updated REGIONS and BUS to include SE and SW
export const REGIONS = ['GHCM', 'CE', 'NO', 'MKD'];
export const BUS = ['GHCM', 'CE', 'NO', 'MKD']; // Added Business Units constant

export const DEFAULT_SETTINGS: AppSettings = {
  // SỬA LỖI LOGO: Link cũ là link trang web, không phải link ảnh trực tiếp.
  // Đã thay thế bằng logo Heineken SVG chính thức.
  // Nếu muốn dùng ảnh riêng từ Postimg, hãy lấy "Direct Link" (thường có dạng https://i.postimg.cc/.../anh.png)
  logoUrl: 'https://i.postimg.cc/8cK41qW9/logo-heineken-new.jpg',
  
  heroImage: 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?q=80&w=2070&auto=format&fit=crop',
  heroTitle: 'Khuấy Động Cuộc Vui\nCùng Heineken Vietnam',
  heroSubtitle: 'Khám phá lịch trình các sự kiện sôi động nhất tại các điểm bán trên toàn quốc. Trải nghiệm đẳng cấp, tận hưởng từng khoảnh khắc.',
  
  ctaTitle: 'Bạn đã sẵn sàng nhập tiệc?',
  ctaDescription: 'Tìm ngay địa điểm gần nhất và tham gia vào không khí lễ hội cùng chúng tôi.',

  scheduleTitle: 'Lịch Trình Sự Kiện',
  scheduleSubtitle: 'Tìm kiếm và theo dõi các hoạt động activation mới nhất.',

  promotions: []
};
