# Skills

There are plenty of skills out there. This library avoids slop and only ships skills that:

1. teach agents concepts LLMs aren't trained on, because they are new or rarely used
2. encode specific, opinionated workflows, validated across multiple codebases

## Install

```bash
npx skills@latest add flornkm/skills
```

## Reference

- **[prefer-container-queries](./skills/prefer-container-queries/SKILL.md)**: Use Tailwind container queries instead of viewport breakpoints, so components respond to the space they are in.
- **[webgl-components](./skills/webgl-components/SKILL.md)**: Ship shader-driven visuals (avatars, orbs, glass) inside a real UI without wrecking performance, accessibility, or the fallback path.
