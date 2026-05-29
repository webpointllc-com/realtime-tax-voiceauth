# Run Prototype C locally

Short pointer — full A/B/C guide: [`docs/ENGINEER_QUICKSTART.md`](../../docs/ENGINEER_QUICKSTART.md).

```bash
git clone https://github.com/webpointllc-com/voice-first-system-temp-prototype.git
cd voice-first-system-temp-prototype/prototype-c
cp .env.example .env
npm ci
npm run dev
```

Open **http://127.0.0.1:5175/** · Node **20+** · mic requires HTTP(S), not `file://`.

Env: [`REQUIRED_ENV.md`](REQUIRED_ENV.md) · [`.env.example`](../.env.example) · welcome TTS: [`WELCOME_TTS.md`](WELCOME_TTS.md).
