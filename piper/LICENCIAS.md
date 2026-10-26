# Voces Piper alojadas en este repositorio

Todos los modelos vienen de https://huggingface.co/rhasspy/piper-voices (proyecto Piper, rhasspy/OHF-Voice). Los archivos de más de 45 MB están partidos en `.partN` para respetar el límite de 100 MB por archivo de GitHub; el juego los vuelve a unir en el navegador.

| Voz | Calidad | Licencia del conjunto de datos (MODEL_CARD) | Fuente de datos |
|---|---|---|---|
| es_ES-davefx | medium | CC0 | https://github.com/OHF-Voice/voice-datasets |
| es_ES-sharvard | medium | CC BY 3.0 | https://datashare.ed.ac.uk/handle/10283/574 |
| es_ES-carlfm | x_low | Dominio público | https://github.com/carlfm01/my-speech-datasets |
| es_ES-mls_10246 | low | CC BY 4.0 | http://www.openslr.org/94/ (Multilingual LibriSpeech) |
| es_ES-mls_9972 | low | CC BY 4.0 | http://www.openslr.org/94/ (Multilingual LibriSpeech) |
| es_MX-ald | medium | Unlicense | https://huggingface.co/datasets/rmcpantoja/Ald_Mexican_Spanish_speech_dataset |
| es_MX-claude | high | Apache-2.0 | https://huggingface.co/spaces/HirCoir/Piper-TTS-Spanish |
| es_AR-daniela | high | CC BY-SA 4.0 | https://www.openslr.org/61/ |

No se incluyó `es_MX-ald-x_low`: su MODEL_CARD no indica licencia (se entrenó con voz sintética de ald-medium y frases de Tatoeba).

Motor (sin CDN externo):
- `vits-web.js`, `piper-*.js`: @diffusionstudio/vits-web 1.0.3, licencia MIT (modificado para cargar todo desde esta carpeta).
- `ort.wasm.min.js`, `ort-wasm*.wasm`: onnxruntime-web 1.18.0, MIT, Microsoft.
- `piper_phonemize.*`: @diffusionstudio/piper-wasm 1.0.0 (MIT), compilación de piper-phonemize que incluye espeak-ng (GPL-3.0). Código fuente: https://github.com/rhasspy/piper-phonemize y https://github.com/espeak-ng/espeak-ng
