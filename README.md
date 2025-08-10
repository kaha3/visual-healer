# 🔎 Visual Healer

**Visual Test Auto-Healer** is a CLI tool that detects UI layout shifts, broken selectors, and visual changes — then proposes automatic fixes and generates reports. Perfect for regression testing and CI pipelines.

![npm](https://img.shields.io/npm/v/visual-healer?style=flat-square)
![CI](https://img.shields.io/badge/CI-ready-green?style=flat-square)
![License](https://img.shields.io/npm/l/visual-healer?style=flat-square)

---

## 🚀 Features

* ✅ Detect layout shifts using visual diffing
* ✅ Compare DOM elements and bounding boxes
* ✅ Auto-suggest updated selectors using smart heuristics
* ✅ Generate:

  * 📄 Markdown report
  * 🌐 HTML report
  * 🧪 JUnit XML report (CI-ready)
* ✅ Support for `--ci` mode to fail builds on detection
* ✅ Custom `--fail-on` filters (`healing`, `layout-shift`, `invalid-selector`)
* ✅ Easy integration with GitHub Actions, GitLab CI, Jenkins

---

## 📦 Installation

```bash
npx visual-healer analyze https://example.com
```

> No install required. Just run it with `npx`.

Or install globally:

```bash
npm install -g visual-healer
```

---

## Quick Start with Examples

```bash
# Install dependencies
npm install

# Run the example
node examples/run-example.js
```

This will:

* Compare screenshots from `examples/baseline` and `examples/actual`
* Generate a full HTML, Markdown, and JUnit report in `/reports`
* Show healing suggestions and visual diffs

---

## 🧪 Usage

### Basic command:

```bash
npx visual-healer analyze https://example.com
```

### With CI mode:

```bash
npx visual-healer analyze https://example.com --ci
```

### Fail CI only on specific issue type:

```bash
# Fail only if auto-healing triggered
npx visual-healer analyze https://example.com --ci --fail-on healing

# Fail only on layout shifts
npx visual-healer analyze https://example.com --ci --fail-on layout-shift

# Fail only if suggested selector is invalid
npx visual-healer analyze https://example.com --ci --fail-on invalid-selector
```

---

## 📂 Output

After running, it will generate:

```
/reports
  ├── report.md             - Human-readable summary
  ├── report.html           - Rich visual report with screenshots
  ├── junit-report.xml      - CI-compatible test results
  ├── diff.png              - Visual difference snapshot
  └── elements/*.png        - Cropped UI element images
```

---

## 🔁 GitLab CI Example

`.gitlab-ci.yml`:

```yaml
visual-healer:
  image: node:18
  script:
    - npm ci
    - npx visual-healer analyze https://example.com --ci --fail-on healing
  artifacts:
    when: always
    paths:
      - reports/junit-report.xml
    reports:
      junit: reports/junit-report.xml
```

---

## 🔁 GitHub Actions Example

`.github/workflows/visual-healer.yml`:

```yaml
name: Visual Healer
on:
  pull_request:
    branches: [ main ]

jobs:
  heal-and-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Run Visual Healer
        run: |
          npx visual-healer analyze --ci --fail-on healing
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: visual-healer-report
          path: reports
```

---

## 💡 Roadmap

* [x] CLI mode
* [x] Visual diffing
* [x] Selector confidence + code snippets
* [x] CI filters
* [x] JUnit report output
* [ ] AI-powered selector generation
* [ ] Web dashboard (optional SaaS)

---

## 🧑‍💻 Author

Made by Kakha Kitiashvili
[https://github.com/kaha3/visual-healer](https://github.com/kaha3/visual-healer)

---

## 📄 License

MIT
