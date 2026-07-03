# Android Release Runbook — v1.0 Pilot

Пошаговый выпуск подписанного APK/AAB для раздачи ~20 семьям.
Владелец: Claude (mobile packaging). Выполняется на машине с Android SDK + JDK 21.

> ⚠️ **Блокер:** нужен прод-URL прокси (`VITE_API_BASE_URL`) — из тикета
> `CODEX_v1.0_deploy_execute.md`. До этого release-сборку не финализируем
> (иначе APK будет ходить в никуда).

## 0. Предусловия
- `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`, `JAVA_HOME` = JBR (JDK 21).
- Release keystore на месте: `apps/prototype/android/keystore.properties` +
  `qoldau-release.keystore` (оба в `.gitignore`, не в git — уже настроено v0.7.5).
- Прод-URL прокси известен (HTTPS).

## 1. Указать прод-backend
```bash
cd apps/prototype
# .env для сборки (не коммитить):
#   VITE_API_BASE_URL=https://<prod-proxy-url>
```

## 2. Версия
`apps/prototype/android/app/build.gradle` → поднять `versionCode` (+1) и
`versionName` (напр. `"1.0.0"`).

## 3. Собрать веб-бандл + синхронизировать
```bash
cd apps/prototype
npm run build
npx cap sync android
```
Проверить: `dist/index.html` содержит относительные пути (`./assets/...`) —
`base: './'` в `vite.config.ts` на месте (иначе APK white-screen).

## 4. Подписанный release-бандл + APK
```bash
cd apps/prototype/android
./gradlew bundleRelease assembleRelease
```
Результат:
- AAB (для Play): `app/build/outputs/bundle/release/app-release.aab`
- APK (прямая раздача): `app/build/outputs/apk/release/app-release.apk`

`signingConfig` подхватывается из `keystore.properties` автоматически
(fallback на unsigned, если keystore отсутствует — тогда сборка не для релиза).

## 5. Дистрибуция
**Вариант A — Google Play Internal Testing (рекомендуется для 20 семей):**
- Play Console → создать приложение → Internal testing → загрузить `app-release.aab`;
- добавить тестеров по email (до 100), разослать opt-in ссылку;
- автообновления, без «неизвестных источников»; аккаунт разработчика $25 разово.
- ⚠️ категория «Kids/Families» — ужесточённая модерация; consent-gate обязателен.

**Вариант B — прямой APK:**
- раздать `app-release.apk` (USB/облако);
- семья включает «Установка из неизвестных источников» для файлового менеджера.

## 6. Проверка на устройстве
Пройти `QA_PLAN_V1.md` §1–§8 на реальном телефоне:
голос → Whisper → Claude → Event → Timeline (без дублей), fallback, роли,
онбординг, consent-gate, приватность, дизайн, back-button, микрофон.

## 7. После зелёного QA
Draft PR `integration/v1.0-...` → master → Ready → раздача пилотной группе.

## Definition of Done (release)
- [ ] APK/AAB собран, подписан, ставится.
- [ ] `VITE_API_BASE_URL` = прод-прокси; голос реально распознаётся на устройстве.
- [ ] Consent-gate показан до первой записи.
- [ ] QA_PLAN_V1.md §1–§8 зелёный.
- [ ] Draft→Ready PR в master.
