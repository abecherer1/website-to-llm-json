# 💀 The Skeletonizer

> Capture the Vibe of any website and feed it to your LLM.
> 

`The Skeletonizer` is a lightweight browser script that distills a website into a clean, token-efficient JSON structure. It strips away the noise (scripts, SVGs, base64 images) but keeps the **structure, classes, styling, and interactive elements**.

You can find the chroe extension here: 

Perfect for **"Vibe Coding"**.

---

## 🚀 Why use this?

When you want an AI to "recreate this design", pasting raw HTML is terrible:

- ❌ **Too many tokens:** Raw HTML is bloated.
- ❌ **Confusing for AI:** Minified JS and SVG paths distract the model.
- ✅ **Skeletonizer JSON:** Provides exactly what the LLM needs: Layout, Colors, Fonts, Spacing, and Component Hierarchy.

---

## 📦 Installation

You don't need to install anything. Just create a bookmark!

1. Create a new bookmark in your browser bar.
2. Name it **"💀 Skeletonize"**.
3. Paste the contents of `content.js` into the URL field.

---

## 🛠 Usage

1. Go to any website you admire (e.g., Apple, Stripe, Linear).
2. Open the Console (`F12` -> Console).
3. Paste the script (if not using bookmarklet).
4. **A `.json` file will automatically download.**

---

## 🤖 How to Prompt the AI (Example)

Upload the JSON file to ChatGPT/Claude and use this prompt:

> "I have attached a JSON skeleton of a website design I like.
Please analyze the 'DESIGN VIBE' and the structure.
Recreate a similar landing page for my project [Project Name] using Tailwind CSS and React.
Maintain the same spacing, typography hierarchy, and color balance."
> 

---

## ✨ Features (v6)

| Feature | Description |
| --- | --- |
| **Semantic Analysis** | Captures `id`, `class`, and HTML tags. |
| **Interactive Detection** | Automatically flags `<button>`, `<a>`, and inputs. |
| **Style Extraction** | Grabs computed styles (Flexbox, Grid, Colors) but ignores defaults. |
| **Privacy Friendly** | Runs entirely in your browser. No data sent to servers. |

---

### License

This project is licensed under the **MIT License** - feel free to fork and use!
