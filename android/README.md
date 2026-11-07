# Conexões VPN — Guia Oficial Android & WireGuard (Produção)

Este projeto integra o frontend moderno **Conexões VPN** à biblioteca oficial **WireGuard para Android** (`com.wireguard.android:tunnel:1.0.20230707`), utilizando o motor nativo `GoBackend` e as APIs oficiais `android.net.VpnService`.

---

## 🛠️ Requisitos para Compilação no seu Ambiente

Para gerar o APK em seu computador ou servidor CI:
1. **JDK**: Java 17 (Eclipse Temurin ou OpenJDK 17).
2. **Android SDK**:
   - `compileSdk`: 34
   - `targetSdk`: 34
   - `minSdk`: 26 (Android 8.0 Oreo+)
   - `build-tools`: 34.0.0
3. **Android Studio**: Iguana (2023.2.1) ou superior.
4. **NDK**: NDK r25+ (para a compilação das bibliotecas C/Go do WireGuard para arquiteturas `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`).

---

## 📦 Compilação Automática via GitHub Actions

O repositório já inclui a automação pronta em `.github/workflows/android-build.yml`.
1. Suba o projeto para o seu repositório no GitHub:
   ```bash
   git add .
   git commit -m "feat: configuracao oficial WireGuard e Android"
   git push origin main
   ```
2. Acesse a aba **Actions** no GitHub.
3. O workflow **Compilar APK Android Oficial** executará automaticamente:
   - Instalação e compilação dos recursos web (`npm run build`).
   - Configuração do Java 17 e do Android SDK.
   - Execução do `./gradlew assembleDebug`.
4. Ao finalizar, baixe o arquivo **`conexoes-vpn-debug-apk`** na seção **Artifacts** da execução.

---

## 💻 Compilação Local no Android Studio

1. Abra o **Android Studio**.
2. Clique em **File ➜ Open** e selecione a pasta `/android`.
3. O Android Studio criará automaticamente o arquivo `local.properties` com o caminho do seu SDK Android.
4. Aguarde a sincronização do Gradle (Sync Now).
5. No menu superior, clique em **Build ➜ Build Bundle(s) / APK(s) ➜ Build APK(s)**.
6. O APK gerado estará em:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Compilação Local via Terminal

Defina o caminho do seu Android SDK no arquivo `android/local.properties`:
- **Windows**: `sdk.dir=C\:\\Users\\SeuUsuario\\AppData\\Local\\Android\\Sdk`
- **macOS**: `sdk.dir=/Users/seu_usuario/Library/Android/sdk`
- **Linux**: `sdk.dir=/home/seu_usuario/Android/Sdk`

Execute:
```bash
# 1. Compilar os assets web
npm run build
mkdir -p android/app/src/main/assets/dist
cp -r dist/* android/app/src/main/assets/dist/

# 2. Compilar o APK Android
cd android
./gradlew assembleDebug
```

---

## 🔐 Como Configurar um Servidor WireGuard Real (VPS Ubuntu / Debian)

Para estabelecer tráfego de dados real e criptografado pela internet, siga o passo a passo de configuração do seu servidor VPS:

### 1. Instalar o WireGuard no Servidor
```bash
sudo apt update && sudo apt install -y wireguard iptables
```

### 2. Gerar Par de Chaves do Servidor
```bash
umask 077
wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key
```

### 3. Gerar Par de Chaves para o Aplicativo Conexões VPN (Cliente)
```bash
wg genkey | tee /etc/wireguard/client_private.key | wg pubkey > /etc/wireguard/client_public.key
```

### 4. Configurar `/etc/wireguard/wg0.conf` no Servidor
```ini
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <CONTEUDO_DE_server_private.key>
# Encaminhamento de pacotes para a interface de internet pública (ex: eth0)
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Cliente Conexões VPN
[Peer]
PublicKey = <CONTEUDO_DE_client_public.key>
AllowedIPs = 10.8.0.2/32
```

### 5. Ativar o Roteamento no Kernel e Iniciar o Serviço
```bash
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.d/99-wireguard.conf
sudo systemctl enable --now wg-quick@wg0
```

---

## 📲 Como Criar o Perfil no Conexões VPN

No aplicativo Conexões VPN (na aba **Perfis ➜ Importar .conf** ou **Novo Perfil**), insira a configuração correspondente ao cliente:

```ini
[Interface]
PrivateKey = <CONTEUDO_DE_client_private.key>
Address = 10.8.0.2/32
DNS = 1.1.1.1, 8.8.8.8
MTU = 1360  # Recomendado: 1360 para UNITEL, 1420 para AFRICELL

[Peer]
PublicKey = <CONTEUDO_DE_server_public.key>
Endpoint = IP_PUBLICO_DO_SEU_SERVIDOR:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
```

Ao tocar no botão de conexão:
1. O Android solicita a permissão oficial do sistema (`VpnService.prepare()`).
2. O **`GoBackend`** oficial do WireGuard inicializa o túnel e valida o handshake.
3. Somente quando o túnel atinge `Tunnel.State.UP` a aplicação apresenta o estado **CONECTADO**.
4. O tráfego e as velocidades exibidas correspondem exatamente aos bytes de rede lidos pelo backend nativo.
