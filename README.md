# Chiến Cơ Huyền Thoại (Legendary Fighter Jet)

Trò chơi bắn máy bay arcade kinh điển được viết lại hoàn toàn bằng **HTML5 Canvas, CSS3 và Vanilla JavaScript** với đồ họa vector sắc nét, hệ thống nâng cấp trang bị, cửa hàng, tùy chọn chiến cơ (skin), kỹ năng Bom Nguyên Tử, cùng nhịp độ trận đấu tiến triển theo thời gian.

![Preview](https://img.shields.io/badge/status-active-success.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ Tính năng nổi bật

- **Đồ họa Vector & Hiệu ứng đỉnh cao**: Sử dụng HTML5 Canvas để vẽ trực tiếp tàu chiến, hiệu ứng hạt nổ (particle bursts), sóng chấn động (shockwaves) và chuyển động màn sao 3 lớp mượt mà.
- **Hỗ trợ đa nền tảng (Responsive & Touch)**: 
  - **Máy tính**: Di chuyển bằng chuột, phím `WASD` hoặc cụm phím mũi tên. Hỗ trợ phím tắt nhanh kỹ năng (`1`, `2`, `3` hoặc `Space` cho vật phẩm, `N` hoặc `4` cho Bom nguyên tử, `P` để tạm dừng).
  - **Điện thoại / Thiết bị di động**: Tối ưu hóa tuyệt đối cho thao tác kéo thả ngón tay trực tiếp trên màn hình, tự động co giãn theo tỉ lệ khung hình (scale-to-fit) và ẩn con trỏ chuột khi chơi.
- **Hệ thống Chiến cơ (Skin) đa dạng**: 
  - Sở hữu 4 mẫu chiến cơ độc quyền (`Alpha`, `Phoenix`, `Viper`, `Nova`) với kiểu dáng vector, thông số và hiệu ứng động cơ riêng biệt.
- **Cửa hàng & Nâng cấp sức mạnh**: 
  - Tăng cấp độ đạn (sát thương và số nòng), tốc độ bắn và giáp thân bằng số xu tích lũy sau mỗi trận đấu.
  - Mua sắm trang bị hỗ trợ chiến đấu: Cứu thương, Khiên bảo vệ, Bom thông minh.
- **Vật phẩm rơi ngẫu nhiên (Power-ups)**: Thu thập các vật phẩm hỗ trợ giữa trận như khiên, hồi máu, đạn tỏa, đạn xuyên, tăng tốc độ bắn và nhân đôi điểm số.
- **Nhịp độ trận đấu động (Dynamic Pace)**: Độ khó và tốc độ game tự động tăng dần theo số điểm đạt được, kèm theo sự xuất hiện của các trận chiến Boss kịch tính.
- **Lưu trữ tiến trình tự động**: Sử dụng `localStorage` để lưu lại toàn bộ xu, cấp độ nâng cấp, chiến cơ đã sở hữu và kỷ lục cá nhân.

---

## 🎮 Hướng dẫn điều khiển

| Thao tác | Máy tính (Keyboard / Mouse) | Thiết bị di động (Touch) |
| :--- | :--- | :--- |
| **Di chuyển** | Chuột, phím `WASD` hoặc Mũi tên | Kéo và thả ngón tay trên màn hình |
| **Bắn súng** | Tự động liên thanh | Tự động liên thanh |
| **Hồi máu** | Phím `1` | Chạm vào biểu tượng Cứu thương |
| **Khiên** | Phím `2` | Chạm vào biểu tượng Khiên |
| **Bom thông minh** | Phím `3` hoặc `Space` | Chạm vào biểu tượng Bom |
| **Bom nguyên tử** | Phím `N` hoặc `4` | Chạm vào nút ☢ góc màn hình |
| **Tạm dừng** | Phím `P` hoặc nút `❚❚` | Chạm vào nút `❚❚` góc màn hình |

---

## 🛠️ Cấu trúc mã nguồn

```text
├── index.html        # Khung giao diện, các màn hình menu, cửa hàng, hangar, HUD trò chơi
├── style.css         # Tệp định dạng, bố cục, hiệu ứng hoạt ảnh CSS, giao diện tối (Dark Theme)
└── script.js         # Logic trò chơi toàn diện (vòng lặp game loop, vật lý va chạm, AI địch/boss, render Canvas, localStorage)
```

---

## 🚀 Cách chạy ứng dụng

1. Tải toàn bộ 3 tệp (`index.html`, `style.css`, `script.js`) vào cùng một thư mục.
2. Mở tệp `index.html` bằng bất kỳ trình duyệt web hiện đại nào (Chrome, Firefox, Edge, Safari).
3. Chọn độ khó, tùy chỉnh chiến cơ tại Hangar và bấm **Bắt đầu chiến đấu**!