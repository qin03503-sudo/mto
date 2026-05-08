import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManualPage() {
  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>راهنمای کاربری فارسی</CardTitle></CardHeader>
        <CardContent className="space-y-4 leading-8">
          <p>۱) ایجاد پیشنهاد: از منوی «پیشنهاد جدید» نام پروژه، شماره پیشنهاد، ارز، تاریخ‌ها و توضیحات را ثبت کنید.</p>
          <p>۲) مدیریت Scope/Line/Part: در صفحه Scope and Lines ابتدا Scope را انتخاب کنید، سپس برای هر Scope خط‌ها را بسازید و برای هر خط قطعات معتبر همان Scope را اضافه کنید.</p>
          <p>۳) قیمت مواد: در صفحه Material Prices فقط ردیف‌های Changed را فیلتر کنید و قیمت پروژه را برای تمام مواد موردنیاز MTO تکمیل نمایید.</p>
          <p>۴) محاسبه: پس از تکمیل Scopeها، Partها و قیمت مواد، محاسبه را اجرا کنید. در صورت داده ناقص، سیستم خطاها را نمایش می‌دهد.</p>
          <p>۵) داشبورد: صفحه Dashboard وضعیت پیشنهادها و بیشترین مبالغ را برای تصمیم‌گیری سریع نشان می‌دهد.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
