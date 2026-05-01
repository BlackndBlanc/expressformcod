# Express Form COD

تطبيق Shopify مبني بـ Remix وShopify CLI وPolaris وPrisma وPostgreSQL لإنشاء نموذج طلب الدفع عند الاستلام داخل صفحات المنتجات.

## التشغيل المحلي

1. انسخ `.env.example` إلى `.env` واملأ مفاتيح Shopify و `SHOPIFY_APP_URL`.
2. شغل PostgreSQL:

```bash
npm run docker-start
```

3. ثبت الحزم ثم جهز Prisma:

```bash
npm install
npm run setup
```

4. شغل التطبيق عبر Shopify CLI:

```bash
npm run dev
```

5. من محرر الثيم أضف بلوك `Express Form COD` في صفحة المنتج، وضع نفس رابط التطبيق العام في إعداد `App URL`.

## ما الذي يفعله التطبيق

- لوحة إدارة embedded داخل Shopify Admin.
- صفحة إعدادات لتعديل أسماء حقول نموذج COD ونص الزر ورسالة النجاح.
- Theme app extension يحقن نموذج COD في صفحة المنتج.
- API عام يستقبل النموذج مع تحقق أساسي من الحقول ورقم الهاتف.
- إنشاء Shopify Draft Order عبر Admin GraphQL API.
- حفظ كل محاولة طلب في PostgreSQL مع حالة النجاح أو الفشل.
- بدون billing وبدون upsell في v1.

## الملفات المنشأة

- `package.json`: تعريف تطبيق Remix/Shopify والاعتمادات وأوامر التشغيل.
- `tsconfig.json`: إعدادات TypeScript الصارمة.
- `remix.config.js`: إعداد Remix وبنية الإخراج.
- `vite.config.ts`: إعداد Vite ومنفذ التطوير.
- `remix.env.d.ts`: أنواع Remix وVite.
- `.gitignore`: تجاهل الملفات السرية والمخرجات.
- `.env.example`: مثال متغيرات البيئة المطلوبة.
- `shopify.app.toml`: إعداد Shopify CLI واسم التطبيق والصلاحيات والامتداد.
- `docker-compose.yml`: خدمة PostgreSQL محلية.
- `prisma/schema.prisma`: نماذج Session وStoreSettings وCodSubmission.
- `prisma/migrations/20260501213000_init/migration.sql`: أول migration لقاعدة البيانات.
- `app/db.server.ts`: Prisma client مشترك وآمن للتطوير.
- `app/shopify.server.ts`: إعداد مصادقة Shopify، التخزين في Prisma، وتسجيل webhook الحذف.
- `app/root.tsx`: جذر Remix مع Shopify App Provider وPolaris CSS.
- `app/routes/auth.$.tsx`: مسار OAuth الخاص بتثبيت التطبيق.
- `app/routes/app.tsx`: Layout لوحة الإدارة والتنقل.
- `app/routes/app._index.tsx`: Dashboard يعرض آخر طلبات COD والإحصائيات.
- `app/routes/app.settings.tsx`: صفحة إعدادات حقول النموذج.
- `app/models/cod.server.ts`: منطق التحقق، حفظ الطلب، وإنشاء Draft Order.
- `app/routes/api.cod.tsx`: API عام للنموذج وجلب الإعدادات للثيم.
- `app/routes/webhooks.app.uninstalled.tsx`: تنظيف جلسات المتجر عند حذف التطبيق.
- `extensions/express-form-cod-theme/shopify.extension.toml`: تعريف Theme app extension.
- `extensions/express-form-cod-theme/blocks/cod-form.liquid`: بلوك نموذج COD في صفحة المنتج.
- `extensions/express-form-cod-theme/assets/express-form-cod.css`: تنسيق النموذج.
- `extensions/express-form-cod-theme/assets/express-form-cod.js`: جلب الإعدادات وإرسال الطلبات للتطبيق.
