# Artifact Planning: Hoan thien HVN TONT Calendar

Ngay cap nhat: 2026-05-26

Tai lieu nay tong hop yeu cau tu `yeu_cau.md`, source code hien tai, va cac quyet dinh da chot trong trao doi.

## 1. Quyet dinh da chot

- Deploy tren Vercel.
- Website public, tam thoi khong can auth noi bo.
- Khong tich hop AI/Gemini.
- Da go source lien quan AI va Admin:
  - `components/GeminiAssistant.tsx`
  - `services/geminiService.ts`
  - `components/AdminPage.tsx`
  - dependency `@google/genai`
  - expose env Gemini trong `vite.config.ts`
- Data lay tu Google Sheet qua Vercel Serverless API.
- Google Sheet private.
- Service Account chi co quyen readonly.
- Service account secret luu trong Vercel Environment Variables, khong nam trong frontend bundle.
- Agency chi nhap lieu tren Google Sheet.
- Khong thiet ke bat ky flow nhap/sua/xoa data nao tu frontend.
- Sheet campaign chinh ten la `Total Campaigns`.
- Khong yeu cau cot `Code`; neu can ID thi backend tu tao.
- Cot `Code` hien tai xem la cot loi/khong dung.
- Tam thoi chua thiet ke join campaign voi venue.
- Tam thoi khong lam ref tu schedule row sang trang detail campaign.
- BU khong thay the Region.
- Activation filter dia ly dung `Province`.
- Cot `Act` chua ro nghia, dang lam ro voi client; tam thoi chua dung lam ten event.
- Giu date window 3 tuan cua Activation nhu source hien tai.
- Khong lay `Act` lam ten event.
- Bo qua ten event trong Activation o giai doan hien tai; neu can se bo sung sau.
- Khong hien thi Code trong UI.
- AWO `Venue List Link` la link maps do nguoi nhap dien san; web chi can mo link nay tren browser.
- API warnings hien thi tren UI noi bo/public website de de debug data sheet.
- Pagination:
  - Table Activation/AWO: 20 dong/trang.
  - Program list: 12 card/trang.
  - Dat pagination o duoi bang/danh sach.
  - Khi filter/sort/search thay doi thi reset ve trang 1.

## 2. Muc tieu web sau khi hoan thien

Website noi bo gom 3 chuc nang chinh:

1. Hien thi cac chuong trinh hien co tu sheet `Total Campaigns`.
   - Click vao card/list item de xem detail.
   - Layout detail giu gan nhu frontend hien tai.

2. Hien thi cac quan dang co chuong trinh Activation.
   - Data lay tu sheet `Activation`.
   - Giu cach filter/sort cua `SchedulePage.tsx`.
   - Co phan trang 20 dong/trang.
   - Tam thoi chua link ten event sang detail.

3. Hien thi cac chuong trinh/quyen loi AWO.
   - Data chinh lay tu `Total Campaigns` voi `Type = AWO`.
   - Giu cach filter/sort cua `AWOSchedulePage.tsx`.
   - `Venue List Link` mo link maps tren browser.
   - Co phan trang 20 dong/trang.

## 3. Kien truc de xuat

### 3.1 Frontend

Giu React/Vite hien tai, nhung thay data static bang API:

- `App.tsx`
  - Dung state `events`, `settings`, `loading`, `error`.
  - Fetch `/api/calendar-data` khi app mount.
  - Fallback co the dung data static trong dev neu API loi, tuy quyet dinh sau.

- `components/ProgramListPage.tsx`
  - Them pagination 12 card/trang.
  - Reset page ve 1 khi search/type/region filter doi.

- `components/SchedulePage.tsx`
  - Them pagination 20 dong/trang.
  - Reset page ve 1 khi filter, sort, show/hide past doi.
  - Giu date window 3 tuan quanh ngay hien tai nhu logic hien co.

- `components/AWOSchedulePage.tsx`
  - Them pagination 20 dong/trang.
  - Giu nut mo `venueListLink`.
  - Reset page ve 1 khi filter/sort/showPast doi.

- Components moi:
  - `components/PaginationControls.tsx`
  - `hooks/usePagination.ts`
  - `services/calendarDataClient.ts`

### 3.2 Backend Vercel Serverless

Endpoint de xuat:

```txt
GET /api/calendar-data
GET /api/health
```

`/api/calendar-data` tra ve:

```ts
interface CalendarDataResponse {
  promotions: Promotion[];
  activationEvents: ProgramEvent[];
  warnings: DataWarning[];
  updatedAt: string;
}
```

Khong can API ghi data.

### 3.3 Vercel Environment Variables

De xuat dung cac bien:

```txt
GOOGLE_SHEET_ID
GOOGLE_CLIENT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_TOTAL_CAMPAIGNS_RANGE='Total Campaigns'!A3:L
GOOGLE_ACTIVATION_RANGE='Activation Template'!B6:U
```

Ghi chu:
- `GOOGLE_PRIVATE_KEY` tren Vercel thuong can thay `\n` thanh newline khi khoi tao client.
- Khong prefix `VITE_` cho secret. Bien co prefix `VITE_` se bi expose sang frontend.
- Google Sheet private chi share quyen Viewer cho `GOOGLE_CLIENT_EMAIL` cua service account.

## 4. Mapping Google Sheet sang model hien tai

### 4.1 Sheet Total Campaigns

Input columns tu yeu cau:

```txt
STT
Brand
Type (Activation/AWO)
Title
BU (VD: GHCM,NO,CE,MKD)
Start Date
End Date
PC Image Link
Mobile Image Link
Venue List Link (AWO only) - Dan link khong rut gon
Content
Code
```

Quyet dinh:
- Dung ten sheet `Total Campaigns`.
- Khong dung `Code`.
- Backend tu tao `id`.
- BU khong thay Region, nhung frontend hien co can `regions`, nen backend co the map tam:
  - `bu = raw BU`
  - `regions = split(raw BU)` de giu UI/filter cu chay duoc.

Mapping sang `Promotion`:

```ts
{
  id: generatedId,
  title: Title,
  brand: Brand,
  content: Content,
  image: PC Image Link,
  mobileImage: Mobile Image Link,
  type: Type,
  startDate: normalizeDate(Start Date),
  endDate: normalizeDate(End Date),
  regions: split(BU),
  cities: [],
  bu: BU,
  venueListLink: Venue List Link
}
```

ID tu tao de xuat:

```ts
slug(`${Brand}-${Type}-${Title}-${Start Date}-${rowNumber}`)
```

### 4.2 Sheet Activation

Input columns tu yeu cau:

```txt
STT
Brand
Scale
BU
Region
Outlet ID
Outlet Name
Street
District
City
Province
Link GG Maps (Khong rut gon)
Sale Rep Name
Hard Phone Contact Sale
WORKING TIME
Check in Time
Check out Time
Act
Date
Type of outlet
Update?
```

Mapping sang `ProgramEvent` hien tai/mo rong:

```ts
{
  id: generatedId,
  brand: Brand,
  scale: Scale,
  bu: BU,
  region: Region,
  outletId: Outlet ID,
  venue: Outlet Name,
  address: join(Street, District, City, Province),
  mapLink: Link GG Maps,
  ward: '',
  city: Province,
  district: District,
  province: Province,
  saleRep: Sale Rep Name,
  hardPhoneContactSale: Hard Phone Contact Sale,
  date: normalizeDate(Date),
  time: WORKING TIME || `${Check in Time} - ${Check out Time}`,
  act: Act,
  typeOfOutlet: Type of outlet,
  updated: Update?
}
```

Quyet dinh hien tai:
- Chua join `Act` voi campaign.
- Chua tao ref sang detail.
- Khong lay `Act` lam ten event.
- Bo qua ten event trong Activation o giai doan hien tai; se bo sung sau khi client co format chinh thuc.

## 5. Data validation va normalization

Backend can lam sach data truoc khi tra frontend:

- Trim tat ca text fields.
- Date ve `YYYY-MM-DD`.
- Bo qua row khong co date hop le trong Activation.
- Bo qua row khong co `Title` trong Total Campaigns.
- Normalize type chi nhan `Activation` hoac `AWO`.
- Map link Google Maps:
  - Neu link khong co `https://`, them `https://` khi co the.
  - Neu rong thi frontend hien text address, khong tao link.
- Split BU/Region bang dau phay, trim tung item.
- Tra `warnings` cho cac row loi de debug noi bo.
- Frontend hien thi warnings tu API de nguoi van hanh thay loi data sheet.

`DataWarning` de xuat:

```ts
interface DataWarning {
  sheet: 'TotalCampaigns' | 'Activation';
  row: number;
  field: string;
  message: string;
}
```

## 6. Ke hoach sua source theo giai doan

### Phase 1: Don source va dam bao build

Trang thai: da thuc hien mot phan.

Da lam:
- Xoa Gemini/AI files.
- Xoa AdminPage.
- Go `@google/genai`.
- Go env expose Gemini khoi `vite.config.ts`.
- Go mention Gemini trong README.

Can verify:
- `npm run build`
- `npm audit`
- `rg "Gemini|genai|AdminPage|GEMINI|API_KEY"`

### Phase 2: Them pagination

Files tao moi:
- `hooks/usePagination.ts`
- `components/PaginationControls.tsx`

Files sua:
- `components/SchedulePage.tsx`
- `components/AWOSchedulePage.tsx`
- `components/ProgramListPage.tsx`

Chi tiet:
- `SchedulePage`: page size 20.
- `AWOSchedulePage`: page size 20.
- `ProgramListPage`: page size 12.
- Pagination dat duoi bang/list.
- `useEffect` reset page ve 1 khi filters/sort/search doi.

### Phase 3: Them API client frontend

Files tao moi:
- `services/calendarDataClient.ts`

Files sua:
- `App.tsx`
- `types.ts`

Chi tiet:
- `fetchCalendarData()` goi `/api/calendar-data`.
- `App.tsx` co loading/error state.
- Khi data load xong:
  - `events = activationEvents`
  - `settings.promotions = promotions`

### Phase 4: Them Vercel Serverless API

Files tao moi:
- `api/calendar-data.ts`
- `api/health.ts`
- `api/_googleSheets.ts`
- `api/_mappers.ts`
- `api/_validators.ts`

Chi tiet:
- Doc Google Sheet bang service account.
- Map `Total Campaigns` sang `Promotion[]`.
- Map `Activation` sang `ProgramEvent[]`.
- Cache response bang header:

```txt
Cache-Control: s-maxage=300, stale-while-revalidate=3600
```

### Phase 5: Chuyen UI sang data API

Files sua:
- `App.tsx`
- `constants.ts`
- `README.md`

Chi tiet:
- `DEFAULT_SETTINGS` chi giu logo/copy/static UI.
- Promotions lay tu API.
- Events lay tu API.
- Co empty state neu sheet chua co data.
- Co error state neu API loi.

### Phase 6: AWO theo quyet dinh hien tai

Files sua:
- `components/AWOSchedulePage.tsx`

Chi tiet:
- Tiep tuc dung `promotions.filter(p => p.type === 'AWO')`.
- Giu nut mo `venueListLink`.
- Them pagination.
- Chua parse venue list link.
- Chua render venue-level rows.

## 7. Nhung viec tam thoi KHONG lam

- Khong tich hop AI.
- Khong co Admin UI.
- Khong nhap lieu frontend.
- Khong join campaign voi venue.
- Khong dung/khong hien thi Code.
- Khong link schedule row sang campaign detail.
- Khong parse Google Maps venue list thanh danh sach quan.

## 8. Cau hoi con can chot

Khong con cau hoi bat buoc truoc khi bat dau implement phase tiep theo.

## 9. Thu tu implement khuyen nghi

1. Hoan tat cleanup va verify build.
2. Them pagination cho data static hien tai.
3. Them API client + loading/error state, nhung van fallback data static.
4. Them Vercel Serverless API doc Google Sheet.
5. Chuyen frontend sang API response.
6. Cap nhat README huong dan setup Vercel env va Google Sheet sharing.
7. Test tren local va Vercel preview.
