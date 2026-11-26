# Compilación en GitHub y Publicación en Google Play Store (Android)

El proyecto está configurado con **Capacitor Android** (`mx.org.sntss.normativa`, `compileSdk = 36`, `targetSdk = 36`, `minSdk = 24`) y dos flujos de GitHub Actions:

- **`.github/workflows/build-android-apk.yml`**: compila en cada `push` o ejecución manual el paquete **APK de depuración (`app-debug.apk`)**, el paquete **Play Store App Bundle (`app-release.aab`)** y, si existen los secretos de firma, el **APK Release firmado (`app-release.apk`)**.
- **`.github/workflows/publish-play-store.yml`**: firma el `.aab` de producción y lo sube automáticamente a **Google Play Console** (`internal`, `alpha`, `beta` o `production`).

---

## 1. Generar la llave de firma (Upload Keystore)

Ejecuta este comando una sola vez en tu computadora (con Java JDK instalado) y guarda en lugar seguro tanto el archivo `.jks` como las contraseñas:

```bash
keytool -genkeypair -v \
  -keystore upload-keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias normativa-upload
```

Convierte el archivo `.jks` a Base64 (en una sola línea) para guardarlo en GitHub Secrets:

- **Linux / Git Bash:**
  ```bash
  base64 -w 0 upload-keystore.jks
  ```
- **macOS:**
  ```bash
  base64 -i upload-keystore.jks | tr -d '\n'
  ```

> **Importante:** nunca subas `upload-keystore.jks` ni `keystore.properties` al repositorio (ya están bloqueados en `.gitignore`).

---

## 2. Configurar Google Cloud y Play Console (Cuenta de Servicio)

1. Entra a **Google Play Console** y crea la aplicación con el ID de paquete **`mx.org.sntss.normativa`** (o verifica que coincida exactamente).
2. En **Google Cloud Console** (dentro del proyecto vinculado a tu Play Console):
   - Habilita **Google Play Android Developer API**.
   - Ve a **IAM y administración → Cuentas de servicio**, crea una cuenta de servicio (ej. `github-play-publisher`) y genera una llave en formato **JSON**.
3. En **Google Play Console → Usuarios y permisos**:
   - Invita el correo de esa cuenta de servicio (`...@...iam.gserviceaccount.com`).
   - Otórgale permisos para administrar versiones (por ejemplo, **Publicar aplicaciones en canales de pruebas** y/o **Administrar versiones de producción**).

---

## 3. Secretos en GitHub (`Settings → Secrets and variables → Actions`)

| Secret | Descripción | Requerido para |
| :--- | :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Contenido del archivo `upload-keystore.jks` en Base64. | Firma `.aab` / `.apk` Release y Play Store |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del almacén de llaves (`keystore`). | Firma `.aab` / `.apk` Release y Play Store |
| `ANDROID_KEY_ALIAS` | Alias de la llave (ej. `normativa-upload`). | Firma `.aab` / `.apk` Release y Play Store |
| `ANDROID_KEY_PASSWORD` | Contraseña de la llave (alias). | Firma `.aab` / `.apk` Release y Play Store |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Contenido completo del archivo `.json` de la cuenta de servicio de Google Play. | Publicación automática en Play Store |

---

## 4. Primer lanzamiento obligatorio en Play Console

Por política de la API de Google Play Developer:

1. **La primera versión de una app nueva debe subirse manualmente una sola vez** en Play Console:
   - Ejecuta **Actions → Build Android (APK + Play Store AAB)** con los 4 secretos de keystore configurados.
   - Descarga el artefacto **`normativa-imss-sntss-playstore-aab`** (`app-release.aab`).
   - Súbelo manualmente en Play Console (por ejemplo en **Prueba interna**) y habilita **Play App Signing**.
2. Completa los formularios obligatorios de Play Console:
   - **Política de privacidad:** el proyecto incluye `/privacy-policy.html` (al desplegar GitHub Pages o tu servidor web, puedes enlazar directamente `https://TU-DOMINIO/privacy-policy.html`).
   - **Seguridad de datos:** declara que no se recopilan datos personales del usuario (la base y los PDF operan offline; las citas guardadas permanecen en almacenamiento local del dispositivo).
   - **Permisos:** únicamente `INTERNET`.
3. A partir de la segunda versión en adelante, puedes publicar directamente desde **Actions → Publish Android to Google Play Store** (eligiendo `track`, `release_status`, `version_code` y `version_name`) o creando un tag Git (`git tag v1.0.1 && git push origin v1.0.1`).

---

## 5. Compilación local opcional

Para generar localmente el `.aab` firmado crea el archivo `android/keystore.properties` (ignorado por Git):

```properties
storeFile=upload-keystore.jks
storePassword=TU_PASSWORD
keyAlias=normativa-upload
keyPassword=TU_PASSWORD
```

Y ejecuta:

```bash
npm install
npm run android:bundle
```

El bundle firmado quedará en `android/app/build/outputs/bundle/release/app-release.aab`.
