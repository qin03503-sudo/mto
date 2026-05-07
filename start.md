برای ارائه یک مستند جامع، ساختاریافته و مهندسی‌شده که هم برای **مدیر محصول (PM)** جهت برنامه‌ریزی و هم برای **تیم توسعه (Frontend, Backend, QA)** جهت پیاده‌سازی کاملاً شفاف باشد، کل اطلاعات (تحلیل ویس، اکسل، دیتابیس، فرمول‌ها و جریان کار) را بر اساس معماری **Domain-Driven Design (DDD)** به بخش‌ها و دامنه‌های مختلف می‌شکنم.

در ادامه، **ساختار درختی فایل‌ها و فولدرهای پروژه (Project Documentation Structure)** همراه با جزئیات کامل محتوای هر فایل آورده شده است.

---

# 📂 ساختار درختی مستندات پروژه (MTO Pricing Web App)

```text
📦 docs/
 ┣ 📂 00_Project_Overview/              (اطلاعات پایه و معرفی پروژه)
 ┣ 📂 01_Product_Requirements_PRD/      (مستندات مدیر محصول و نیازمندی‌ها)
 ┣ 📂 02_Architecture_System_Design/    (معماری کلی سیستم)
 ┣ 📂 03_Database_Design/               (طراحی پایگاه داده و اسکیمای SQL)
 ┣ 📂 04_API_Contracts/                 (قراردادها و اندپوینت‌های بک‌اند)
 ┣ 📂 05_Frontend_UI_UX/                (ساختار فرانت‌اند، صفحات و وایرفریم‌ها)
 ┣ 📂 06_Calculation_Engine/            (هسته محاسباتی و منطق فرمول‌ها)
 ┣ 📂 07_Data_Migration_Import/         (منطق انتقال داده‌های اکسل به سیستم)
 ┗ 📂 08_Testing_and_QA/                (معیارهای پذیرش و تست‌کیس‌ها)
```

---

## 📂 جزئیات محتوای هر فولدر و فایل

### 📂 00_Project_Overview (معرفی پروژه و مفاهیم پایه)
این بخش برای Onboarding اعضای جدید تیم است تا بدانند پروژه چیست.

*   📄 **`readme.md`**: خلاصه پروژه. تبدیل سیستم قیمت‌گذاری پروژه‌های باسداکت (Busduct) از اکسل به وب‌اپلیکیشن یکپارچه.
*   📄 **`glossary.md`**: فرهنگ لغات پروژه (MTO چیست، Scope چیست، Line چیست، Part چیست، تفاوت Value و Qty).
*   📄 **`voice_transcript_analysis.md`**: متن پیاده‌سازی شده ویس کارفرما به همراه تحلیل کلمه‌به‌کلمه و استخراج نیازمندی‌ها.
*   📄 **`excel_source_analysis.md`**: تحلیل فایل اکسل `All update MTO` (تعداد ۲۳۹۸ ردیف، ۵ شیت، فرمول‌های VLOOKUP و SUMIFS، ایرادهای دیتای فعلی).

---

### 📂 01_Product_Requirements_PRD (مستندات مدیر محصول)
این دامنه در اختیار PM و تیم Product است.

*   📄 **`business_goals.md`**: اهداف کسب‌وکار (جلوگیری از خطای انسانی، حفظ تاریخچه آفرها، مدیریت قیمت متریال مجزا برای هر پروژه، خروجی سریع).
*   📄 **`user_roles.md`**: تعریف نقش‌ها و دسترسی‌ها (`admin`, `manager`, `estimator`, `sales`, `viewer`).
*   📄 **`user_flows.md`**: جریان‌های کاربری (Flow ساخت آفر جدید، Flow تغییر قیمت متریال، Flow افزودن لاین و قطعه).
*   📄 **`roadmap_phases.md`**: فازبندی پروژه:
    *   *فاز ۰*: پاکسازی دیتا
    *   *فاز ۱ (MVP)*: ساخت آفر، اسکوپ، لاین، محاسبه پایه.
    *   *فاز ۲*: مدیریت پیشرفته قیمت‌ها، لاگ تاریخچه.
    *   *فاز ۳*: PDF، سود و مالیات، اکسپورت، ایمپورت اتوماتیک MTO.

---

### 📂 02_Architecture_System_Design (معماری سیستم)
مستندات برای Technical Lead و Architect.

*   📄 **`high_level_architecture.md`**: معماری پیشنهادی (Modular Monolith برای شروع).
    *   فرانت‌اند: React / Next.js (پیشنهادی)
    *   بک‌اند: Node.js / Python / Go (بسته به تیم)
    *   دیتابیس: PostgreSQL (اجباری به دلیل نوع روابط و محاسبات)
*   📄 **`domain_boundaries.md`**: مرزبندی دامنه‌ها (Domain Boundaries):
    1.  **Auth Domain**: مدیریت کاربران.
    2.  **Master Data Domain**: مدیریت جداول پایه (Scopes, Parts, Materials, MTO).
    3.  **Offer Domain**: مدیریت پروژه‌ها و آفرها (Lines, Line Parts).
    4.  **Calculation Domain**: هسته پردازشی محاسبه قیمت‌ها و Snapshotها.

---

### 📂 03_Database_Design (طراحی پایگاه داده)
نقشه راه تیم بک‌اند و DBA.

*   📄 **`schema_overview.md`**: توضیح روابط جداول (ERD) و دلیل استفاده از `uuid` یا کدهای یکتا.
*   📄 **`01_enums_and_types.sql`**: اسکریپت ساخت نوع داده‌ها (`calculation_method`، `offer_status`).
*   📄 **`02_master_data_tables.sql`**: اسکریپت ساخت جداول `units`, `materials`, `parts`, `scopes`, `mto_versions`, `mto_rows`.
*   📄 **`03_offer_tables.sql`**: اسکریپت جداول `offers`, `project_material_prices`, `offer_scopes`, `offer_lines`, `offer_line_parts`.
*   📄 **`04_calculation_tables.sql`**: اسکریپت جداول کش و لاگ (`calculation_runs`, `calculation_details`, `offer_price_snapshots`).
*   📄 **`05_triggers_and_functions.sql`**: فانکشن‌های حیاتی دیتابیس (تابع کپی متریال پروژه، تریگرهای Outdated کردن محاسبات).
*   📄 **`data_dictionary.md`**: توضیح تک‌تک فیلدها (مثلاً فیلد `is_overridden` در قیمت متریال چه کار می‌کند).

---

### 📂 04_API_Contracts (قراردادهای ارتباطی فرانت و بک‌اند)
مستندات استانداردسازی ارتباطات (قابل تبدیل به Swagger / OpenAPI).

*   📄 **`auth_api.md`**: ورود، خروج، دریافت پروفایل (`POST /auth/login`).
*   📄 **`master_data_api.md`**:
    *   `GET /api/v1/scopes`
    *   `GET /api/v1/parts?scope_id=X` (فیلتر مهم قطعات بر اساس اسکوپ)
    *   `GET /api/v1/materials`
*   📄 **`offer_management_api.md`**:
    *   `POST /api/v1/offers` (ساخت آفر)
    *   `GET /api/v1/offers/{id}` (جزئیات آفر)
    *   `POST /api/v1/offers/{id}/scopes` (افزودن اسکوپ)
    *   `POST /api/v1/offer-scopes/{id}/lines` (افزودن لاین)
    *   `POST /api/v1/offer-lines/{id}/parts` (افزودن قطعه و تعداد)
*   📄 **`pricing_api.md`**:
    *   `GET /api/v1/offers/{id}/material-prices`
    *   `PUT /api/v1/offers/{id}/material-prices/{mat_id}` (ویرایش قیمت متریال پروژه)
*   📄 **`calculation_api.md`**:
    *   `POST /api/v1/offers/{id}/calculate` (فراخوانی موتور محاسبه)
    *   `GET /api/v1/offers/{id}/calculation-results`

---

### 📂 05_Frontend_UI_UX (رابط و تجربه کاربری)
راهنمای تیم فرانت‌اند و طراح UI.

*   📄 **`ui_architecture.md`**: ساختار Componentها، مدیریت State (مثل Redux یا Zustand برای نگهداری دیتای Offer در حال ویرایش).
*   📄 **`pages_routing.md`**: آدرس‌های وب‌اپ:
    *   `/login`
    *   `/offers` (لیست)
    *   `/offers/new`
    *   `/offers/:id/overview`
    *   `/offers/:id/material-prices`
    *   `/offers/:id/scopes-lines`
    *   `/offers/:id/calculation`
*   📂 **`wireframes/`**:
    *   📄 `offer_list_wireframe.md`
    *   📄 `scopes_and_lines_wireframe.md` (نمای درختی پیشنهاد شده)
    *   📄 `material_prices_wireframe.md` (جدول با قابلیت فیلتر تغییریافته‌ها)
*   📄 **`validation_rules.md`**: قوانین سمت فرانت‌اند (جلوگیری از وارد کردن Qty منفی، جلوگیری از انتخاب Part خارج از MTO، نمایش لیبل "نیاز به محاسبه مجدد").

---

### 📂 06_Calculation_Engine (هسته محاسباتی و منطق تجاری)
مهم‌ترین دامنه سیستم که منطق اکسل را کپی می‌کند. (برای تیم بک‌اند)

*   📄 **`core_logic.md`**: توضیح منطق جایگزین `SUMIFS`. (نحوه پیدا کردن قیمت واحد قطعه با جمع زدن ردیف‌های MTO مرتبط با آن قطعه و اسکوپ).
*   📄 **`calculation_methods.md`**: تعریف ۷ حالت محاسبه ردیف‌های MTO:
    1.  `VALUE_X_UNIT_PRICE` (حالت دیفالت)
    2.  `QTY_X_UNIT_PRICE` (برای پیچ و مهره)
    3.  `DIMENSIONAL_WEIGHT` (برای فرمول خاص 7.86 ابعادی)
    4.  `FIXED_TOTAL`
    5.  `ZERO_OR_INFO`
*   📄 **`snapshot_mechanism.md`**: چگونه سیستم پس از هر بار زدن دکمه Calculate، اطلاعات را در `calculation_details` ذخیره می‌کند تا قابلیت Drill-down (مشاهده ریز محاسبات تا سطح متریال) فراهم شود.
*   📄 **`outdated_status_flow.md`**: منطق کثیف شدن (Dirty) محاسبات. (اگر کاربر قیمت متریال X را تغییر داد -> وضعیت تمام قطعاتی که از X استفاده می‌کنند در دیتابیس `outdated` می‌شود -> در فرانت‌اند دکمه Calculate قرمز می‌شود).

---

### 📂 07_Data_Migration_Import (انتقال داده‌ها)
راهنمای پاک‌سازی فایل اکسل کارفرما و انتقال آن به دیتابیس جدید.

*   📄 **`data_cleaning_guide.md`**:
    *   یکسان‌سازی نام متریال‌ها (حذف فاصله‌های اضافی).
    *   یکسان‌سازی واحدها (تبدیل `7.86` از ستون Unit به فرمول محاسبه ابعادی).
    *   رفع مشکل ۲۰۰ ردیف بدون Unit Price در فایل مبدا.
*   📄 **`import_staging_flow.md`**: معماری ایمپورت اکسل MTO. (آپلود فایل -> ذخیره در جدول موقت `staging_mto_rows` -> اعتبارسنجی نرم‌افزاری -> انتقال به جدول اصلی `mto_rows` تحت یک `mto_version_id` جدید).

---

### 📂 08_Testing_and_QA (تست و تضمین کیفیت)
سناریوهای تست برای اطمینان از اینکه خروجی نرم‌افزار دقیقاً با اکسل یکی است.

*   📄 **`acceptance_criteria.md`**: (شاخص‌های قبولی)
    *   **تست ۱ (MTO Total):** جمع کل جدول مادر در دیتابیس باید دقیقاً `54,798,877,829.239` ریال باشد.
    *   **تست ۲ (Part Unit Price):** قیمت قطعه `FEEDER-1000` در اسکوپ `1000A AL` با قیمت‌های پایه باید دقیقاً `802,700,038.30` ریال شود.
    *   **تست ۳ (Line Calculation):** اگر ۲ عدد `TOP OFF BOX 250` وارد شد، قیمت کل آن سطر در لاین باید `440,640,000` شود.
*   📄 **`edge_cases_test_plan.md`**:
    *   تست تغییر قیمت: قیمت متریال را در پروژه A تغییر دهیم؛ نباید قیمت پروژه B تغییر کند.
    *   تست نسخه‌بندی: اگر MTO جدید ایمپورت شد، پروژه‌های قبلی که با MTO قدیمی بسته شده‌اند نباید تغییر مبلغ دهند.

---

### 💡 نحوه استفاده از این ساختار (برای مدیر پروژه / اسکرام مستر)

1.  **برای شروع پروژه:** ابتدا فولدر `00` و `01` را با تیم مرور کنید تا همه درک مشترکی از "آفر"، "اسکوپ"، "لاین" و "MTO" پیدا کنند.
2.  **برای تیم بک‌اند:** فولدرهای `03` (دیتابیس) و `06` (موتور محاسبه) را به عنوان تسک‌های Sprint 1 تعریف کنید. ساختار جداول و تابع محاسباتی کاملاً آماده است.
3.  **برای تیم فرانت‌اند:** فولدر `05` (UI/UX) و جریان‌های کاربری را مبنای ساخت صفحات قرار دهید. تمرکز اولیه روی پیاده‌سازی فرم درختی `Scopes & Lines` باشد.
4.  **برای QA:** از روز اول تست‌های ریاضی نوشته شده در فولدر `08` را در Postman یا ابزار تست خودکار قرار دهید. هرگونه اختلاف ۱ ریالی به معنای باگ در موتور محاسبه است.
