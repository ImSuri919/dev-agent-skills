# dev-agent-skills

![CI](https://github.com/ImSuri919/dev-agent-skills/actions/workflows/ci.yml/badge.svg)
![skills](https://img.shields.io/badge/skills-16-brightgreen)

[English README](README.md) | [Playground](https://imsuri919.github.io/dev-agent-skills/) | [Eval परिणाम](docs/eval-results.md)

कोडिंग एजेंट्स के लिए 16 छोटी, दोबारा इस्तेमाल होने वाली निर्देश फाइलें। हर फाइल एक काम सिखाती है: PR review करना, टेस्ट प्लान बनाना, बग की जांच करना, release notes लिखना।

## ये किस काम की है

एजेंट को बार-बार वही निर्देश चैट में लिखने की जगह आप एक फाइल सेव कर देते हैं। जब भी कोई काम मेल खाता है, एजेंट उसी फाइल के स्टेप्स फॉलो करता है। पूरी टीम को एक जैसा जवाब मिलता है और फाइल Git में रहती है।

## क्या खास है

- **MCP server**: एजेंट सिर्फ जरूरत के हिसाब से स्किल लोड करता है। चार टूल मिलते हैं: `list_skills`, `get_skill`, `match_skill`, `get_manifest`।
- **Eval scorecard**: 19 परीक्षणों में देखा जाता है कि किसी सामान्य अनुरोध पर सही स्किल चुनी जा रही है या नहीं। परिणाम [docs/eval-results.md](docs/eval-results.md) में है।
- **Installer**: एक कमांड से OpenCode, Claude Code, Codex और Gemini में स्किल कॉपी हो जाती हैं। SHA-256 lockfile से पता चलता है कि कोई फाइल बदली तो नहीं।
- **Skill graph**: स्किल्स के आपसी hand-off का नक्शा, और अगर चक्र बने तो CI फेल।
- **Playground**: ब्राउज़र में खोजें, प्रॉम्प्ट टाइप करें और देखें कि कौन सी स्किल चुनी जाएगी।

## स्किल्स की सूची

| स्किल | काम |
| --- | --- |
| `code-review-brief` | PR का छोटा और उपयोगी review ब्रीफ |
| `test-plan` | सही टेस्ट केस चुनना |
| `perf-triage` | धीमेपन का मापकर कारण निकालना |
| `a11y-focus-check` | कीबोर्ड और focus की जांच |
| `release-notes` | यूज़र के लिए release notes |
| `debug-triage` | एरर की जांच और सबूत |
| `api-contract` | API का request और response तय करना |
| `docs-writer` | पढ़ने लायक README और गाइड |
| `refactor-simplify` | हटाने लायक कोड खोजना |
| `skill-author` | नई स्किल लिखना |
| `seo-basics` | साइट की पहली technical SEO जांच |
| `gradle-build-triage` | Gradle build फेल होने का सटीक कारण |
| `compose-ui-review` | Compose screen की state, recomposition और accessibility जांच |
| `adb-debug` | डिवाइस से logcat लेकर क्रैंश डिबग करना |
| `play-store-release` | Play Store rollout और rollback प्लान |
| `android-permissions-check` | merged manifest की permission ऑडिट |

Android प्रोजेक्ट में भी यही फाइलें काम करती हैं। उन्हें एजेंट की स्किल डायरेक्टरी में कॉपी करें; ऐप में कोई नई Android dependency नहीं जुड़ती।

## इस्तेमाल

फाइलों को एजेंट की स्किल डायरेक्टरी में कॉपी करें:

```sh
cp -R skills/code-review-brief ~/.config/opencode/skills/
```

या CLI से:

```sh
node scripts/install.mjs --agent opencode
node scripts/install.mjs --agent opencode --check
node scripts/install.mjs --agent opencode --frozen
```

सब जांच एक साथ चलाने के लिए:

```sh
npm run verify
```

Node 20 या नया चाहिए। कोई package इंस्टॉल नहीं करना पड़ता।

## अपनी स्किल जोड़ें

```sh
npm run new -- meri-skill "Ek kaam karta hai. Use jab ..."
```

फिर हर section भरें, README और `skills.manifest.json` में एंट्री जोड़ें, `evals/cases.json` में एक केस जोड़ें, `npm run lock` चलाएं और अंत में `npm run verify`।

## लाइसेंस

MIT। [LICENSE](LICENSE) देखें।
