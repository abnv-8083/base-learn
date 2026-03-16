# Project Setup & Architecture Guide

## Architecture Overview
This project follows a **Shared-Asset Micro-Frontend** pattern. Each portal in `apps/` is an independent module that shares a core design system located in `assets/css/global.css`.

### Directory Guidelines
- **Adding new features**: Add specific CSS to the portal's local folder (e.g., `apps/student/student-portal.css`).
- **Global changes**: Modify `assets/css/global.css` if the change affects all portals (like color themes or typography).
- **Assets**: Always place images in `assets/img/` and reference them using relative paths (e.g., `../../assets/img/file.png`).

## Team Workflow
1. **Branching**: Use feature-based branches (e.g., `feature/student-login`).
2. **Consistency**: Always use the CSS variables defined in `global.css` for colors and spacing.
3. **Icons**: This project uses **Phosphor Icons**. Refer to [phosphoricons.com](https://phosphoricons.com) for the icon library.
