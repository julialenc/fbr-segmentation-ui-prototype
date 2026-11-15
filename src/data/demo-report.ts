/** Assembles the synthetic demonstration report. Replace with an approved report JSON. */
import fixture from "./fbr_segmentation_ui_synthetic_fixture.json";
import supplementary from "./supplementary_synthetic_views.json";
import { parseReport } from "@/segmentation/normalize";

export const demoReport = parseReport({
  ...fixture,
  views: [...fixture.views, ...supplementary.views],
});
