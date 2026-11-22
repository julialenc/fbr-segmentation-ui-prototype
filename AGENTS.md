<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- `src/segmentation/` is a self-contained, host-agnostic module (types, normalize, format rules, components); keep it free of backend/hosting dependencies so it can be copied into any React app.
- Report data enters only as `SegmentationReport` JSON validated by `parseReport`; presentation logic must never hardcode segment counts, metric keys or claim keys.
- All display rules (missing ≠ 0, claim denominators, count wording) live in `format.ts` and are covered by `format.test.ts`.
- Legacy synthetic comparison views: phones (`compact` variant: width < 768px or height ≤ 500px) render `MobileComparison` (characteristic-first, page scroll); larger screens render `ComparisonTable`. Both share `format.ts` and the same view data — never fork formatting logic.

- Accepted presentation schema 1.0-presentation uses the validated SegmentationReport.research extension; it may have no legacy segment views. Render research outcomes independently of model status. Keep narrative and populations in page flow on all screen sizes.
