# Yêu Cầu Dự Án HVN TONT Calendar

## 1. Tổng Quan

- Xây dựng một website nội bộ, deploy bằng Vercel.
- Website là public/internal website, nhưng không được để API key hoặc secret ở frontend.
- Dữ liệu được nhập và quản lý trên Google Sheet bởi agency.
- Client chỉ muốn nhập liệu trên Google Sheet.
- Không thiết kế chức năng nhập liệu từ frontend.
- Không viết script nhập liệu từ frontend.
- Website cần hỗ trợ phân trang.

## 2. Loại Chương Trình

Website có 2 loại chương trình:

- `Activation`
- `AWO`

## 3. Chức Năng Chính

### 3.1. Hiển Thị Danh Sách Chương Trình

- Lấy dữ liệu từ tab `Total Campaigns`.
- Hiển thị các chương trình hiện có.
- Click vào một chương trình sẽ mở trang chi tiết chương trình.
- Cách trình bày thông tin chi tiết giữ theo thiết kế frontend hiện tại.
- `Code` trong `Total Campaigns` là slug/id của chương trình.

### 3.2. Hiển Thị Lịch Activation

- Dữ liệu Activation không lấy trực tiếp từ tab `Activation Template`.
- `Activation Template` chỉ là template để agency copy sang các tab nhập liệu thực tế.
- Backend/API không cần đọc tab `Activation Template`.
- Dữ liệu Activation lấy từ 3 tab:
  - `IOB`
  - `FOCUS`
  - `GS`
- Các tab này dùng cùng template với `Activation Template`.
- UI lấy thiết kế, sort và filter theo `ActivationSchedulePage.tsx`.
- Hiển thị thêm trường `Tên event`.
- `Tên event` lấy bằng cách dùng `Code Event` trong tab Activation để tham chiếu ngược về `Code` trong tab `Total Campaigns`.
- Khi user click vào `Tên event`, chuyển sang trang chi tiết chương trình tương ứng.

### 3.3. Hiển Thị Lịch AWO

- Dữ liệu AWO lấy từ tab `Total Campaigns`.
- Chỉ lấy các chương trình có `Type = AWO`.
- UI lấy thiết kế, sort và filter theo `AWOSchedulePage.tsx`.
- Venue list/map link lấy từ trường `Venue List Link (AWO only) - Dán link không rút gọn` trong tab `Total Campaigns`.
- Link venue/map AWO mở ở tab mới.
- Nguồn link venue/map AWO có thể được cung cấp/tạo từ một bên khác trong tương lai.
- Hiển thị thêm trường `Tên event`.
- Trên AWO page, `Tên event` chính là `Title` của chương trình.
- Khi user click vào `Tên event`, chuyển sang trang chi tiết chương trình tương ứng.

## 4. Thiết Kế Google Sheet

### 4.1. Tab `Total Campaigns`

Tab này là nguồn dữ liệu chính cho danh sách chương trình, chi tiết chương trình và AWO.

| Cột | Field | Ghi chú |
| --- | --- | --- |
| A | `STT` | Số thứ tự |
| B | `Brand` | Brand chương trình |
| C | `Type (Activation/AWO)` | Chỉ nhận `Activation` hoặc `AWO` |
| D | `Title` | Tên chương trình |
| E | `BU (VD: GHCM,NO,CE,MKD)` | BU/khu vực áp dụng, có thể nhiều giá trị |
| F | `Start Date` | Ngày bắt đầu |
| G | `End Date` | Ngày kết thúc |
| H | `PC Image Link` | Ảnh desktop |
| I | `Mobile Image Link` | Ảnh mobile |
| J | `Venue List Link (AWO only) - Dán link không rút gọn` | Link venue/map cho AWO |
| K | `Content` | Nội dung chi tiết chương trình |
| L | `Code` | Slug/id chương trình |

#### Quy Tắc `Code`

- `Code` là slug của chương trình/event.
- `Code` được dùng làm ID chính của chương trình.
- URL detail của chương trình nên dùng `Code`, ví dụ:

```text
/programs/tiger-festive-2026
```

### 4.2. Tab `Activation Template`

Tab này chỉ là template mẫu.

- Agency copy template này sang các tab nhập liệu thực tế.
- Template bắt đầu từ cột `B` đến cột `V`.
- Header nằm ở các dòng `6`, `7`, `8`.
- Data bắt đầu từ dòng `9`.

Các tab nhập liệu thực tế cần giữ cùng cấu trúc với template này.

### 4.3. Các Tab Dữ Liệu Activation

Dữ liệu Activation thực tế lấy từ 3 tab:

| Tab | Vai trò |
| --- | --- |
| `IOB` | Nguồn dữ liệu Activation |
| `FOCUS` | Nguồn dữ liệu Activation |
| `GS` | Nguồn dữ liệu Activation |

Các tab này dự kiến có range:

```text
'IOB'!B6:V
'FOCUS'!B6:V
'GS'!B6:V
```

## 5. Field Của Activation Template

Các tab `IOB`, `FOCUS`, `GS` dùng cùng bộ field với template Activation.

| Field | Ghi chú |
| --- | --- |
| `STT` | Số thứ tự |
| `Brand` | Brand |
| `Scale` | Quy mô/loại activation |
| `BU` | Business Unit |
| `Region` | Region |
| `Outlet ID` | ID outlet |
| `Outlet Name` | Tên quán/outlet |
| `Street` | Đường |
| `District` | Quận/huyện |
| `City` | Thành phố |
| `Province` | Tỉnh/thành |
| `Link GG Maps (Không rút gọn)` | Link Google Maps |
| `Code Event` | Slug tham chiếu sang `Total Campaigns.Code`, nằm ở cột `N` |
| `Sale Rep Name` | Tên sales rep |
| `Hard Phone Contact Sale` | Số điện thoại contact sale |
| `Check in Time` | Giờ bắt đầu |
| `Check out Time` | Giờ kết thúc |
| `Act` | Chưa rõ nghĩa, đang làm rõ |
| `Date` | Ngày activation |
| `Type of outlet` | Loại outlet |
| `Update?` | Trạng thái update |

## 6. Quy Tắc Hiển Thị Và Xử Lý Dữ Liệu

### 6.1. Activation

- Merge dữ liệu từ 3 tab `IOB`, `FOCUS`, `GS` vào một danh sách `activationEvents`.
- Khi ingest data từ các tab Activation:
  - Sắp xếp mặc định theo `Date + Check in Time`.
  - Row nào thiếu thời gian thì coi là `null` và xếp sau.
- Bỏ phần phạm vi 3 tuần ở Schedule.
- Bỏ ràng buộc phải có ngày ở Activation.
- Dữ liệu thiếu ngày vẫn hiển thị, nhưng xếp cuối bảng.
- Dữ liệu thiếu `Outlet Name` vẫn hiển thị, cột tên quán để trống hoặc hiển thị `-`.
- Filter địa điểm của Activation dùng `Province`, không dùng `City`.
- `WORKING TIME` trên giao diện là giá trị hiển thị ghép từ `Check in Time - Check out Time`.
- Cột `Tên event` trong Activation Schedule đặt sau cột `Thời gian`, trước cột `Province`.

### 6.2. Join `Code Event` Với `Total Campaigns`

- `Code Event` trong các tab Activation là slug/id chương trình.
- `Code Event` không bắt buộc phải có trên mọi row Activation.
- Backend dùng `Code Event` để tìm chương trình tương ứng trong `Total Campaigns.Code`.
- Sau khi join:
  - Hiển thị `Tên event` bằng `Total Campaigns.Title`.
  - `Tên event` là link sang trang detail:

```text
/programs/{Code}
```
- Nếu `Code Event` trống hoặc không match với `Total Campaigns.Code`, row Activation vẫn hiển thị nhưng field `Tên event` để trống và không có link detail.

### 6.3. AWO

- AWO lấy từ `Total Campaigns`.
- Các chương trình AWO là các row có `Type = AWO`.
- Venue list/map link lấy từ `Venue List Link (AWO only) - Dán link không rút gọn`.
- AWO cũng cần hiển thị `Tên event` và link sang detail.

### 6.4. Scale

Field `Scale` nhận 5 giá trị:

- `Full`
- `Basic`
- `Tạ Hiện`
- `Roving`
- `Fix Activation`

Yêu cầu hiển thị:

- Trên giao diện Schedule, mỗi giá trị `Scale` cần có màu khác nhau.
- Trên giao diện AWO, nếu có hiển thị `Scale`, mỗi giá trị cũng cần có màu khác nhau.
- Màu do developer tự chọn, ưu tiên dễ phân biệt.

## 7. Quyết Định Đã Chốt

1. Tab `Total Campaigns` header bắt đầu ở `A3:L`.
2. Cột `Code` trong `Total Campaigns` nằm ở cột `L`.
3. Ba tab `IOB`, `FOCUS`, `GS` cùng format `B6:V`, header dòng `6-8`, data từ dòng `9`.
4. `Code Event` nằm ở cột `N`.
5. `Code Event` không bắt buộc.
6. Nếu `Code Event` không match với `Total Campaigns.Code`, row vẫn hiển thị, field `Tên event` để trống.
7. Row thiếu `Date` vẫn hiển thị nhưng xếp cuối bảng.
8. Sort mặc định Activation theo `Date + Check in Time`.
9. Filter Activation dùng `Province`.
10. `WORKING TIME` là text hiển thị ghép từ `Check in Time - Check out Time`.
11. Màu của `Scale` do developer tự chọn.
12. Không đọc tab `Activation Template` trong API/env; chỉ đọc `IOB`, `FOCUS`, `GS`.
13. Cột `Tên event` trong Activation Schedule đặt sau cột `Thời gian`, trước cột `Province`.
14. Trên AWO page, `Tên event` chính là `Title`.
15. Click venue/map AWO mở link ở tab mới; nguồn link có thể được cung cấp/tạo từ bên khác.
16. Nếu `Total Campaigns.Code` bị trùng, backend hiển thị warning và dùng row đầu tiên cho việc join/detail.
17. Nếu thay đổi `Code` trên Sheet, URL cũ mất hiệu lực là chấp nhận được.
18. Sau khi Sheet cập nhật và API đọc lại dữ liệu, truy cập bằng URL slug/Code mới phải mở được detail chương trình tương ứng.
19. Giai đoạn hiện tại, link venue/map AWO vẫn đọc từ `Venue List Link (AWO only) - Dán link không rút gọn`.

## 8. Gợi Ý Thiết Kế Backend

Nên thiết kế backend theo pipeline ETL nhẹ:

```text
Extract Google Sheet
  -> Transform/Normalize rows
  -> Join Code Event với Total Campaigns
  -> Validate + warnings
  -> Load JSON response cho frontend
```

Frontend không cần biết Activation đến từ nhiều tab. Frontend chỉ nhận:

```ts
{
  promotions: Promotion[],
  activationEvents: ProgramEvent[],
  warnings: DataWarning[],
  updatedAt: string
}
```

## 9. Câu Hỏi Cần Làm Rõ

Hiện các yêu cầu chính đã được chốt. Nếu phát sinh thêm thay đổi về format Google Sheet hoặc UI, bổ sung vào phần này trước khi triển khai.
