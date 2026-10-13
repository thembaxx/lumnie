# Lumni

**A little more curious.**

Explore STEM for South African Grades 10–12 with Lumni: interactive 3D models, maths and science mini-lessons, quizzes, puzzles and offline learning.

The repository name `lumnie` is an implementation identifier; the public name is **Lumni**. Keep the existing wordmark, icon and visual directions. `src/lib/brand.ts` holds the name, positioning, features, scope and sources used by search metadata and public documentation. Saved-data keys remain stable.

Voice: curious, encouraging and clear; explain the concept before awarding progress. Keep factual, descriptive search titles separate from the expressive tagline.

The existing spark mark, Fraunces headings, DM Sans controls, warm Playground palette and alternate Atlas palette stay consistent across the app and public overview.

Discovery defaults to the verified production origin `https://lumnie.vercel.app`. Set `NEXT_PUBLIC_SITE_URL` before building to change it; an explicit empty value omits canonicals and sitemap URLs and marks pages noindex. Use an HTTP(S) origin with no path, query, fragment or credentials.

Public endpoints: `/about/`, `/about.md`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llm.txt` (same index), `/llms-full.txt` and a 1200×630 `/social.png` card. These contain public product information only. LLM files describe the app; they do not control crawler access or guarantee citations.
