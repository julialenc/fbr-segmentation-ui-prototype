import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { ResearchSearch } from "@/routes/index";
const state = vi.hoisted(() => ({
  search: { area: "overview", family: "", region: "FR" } as ResearchSearch,
  navigate: vi.fn(),
}));
vi.mock("@/routes/index", () => ({
  Route: { useSearch: () => state.search, useNavigate: () => state.navigate },
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    search,
    children,
    to: _to,
    ...props
  }: {
    search: Record<string, string>;
    children: ReactNode;
    to: string;
  }) => (
    <a href={`/?${new URLSearchParams(search)}`} {...props}>
      {children}
    </a>
  ),
}));
import { ResearchSite } from "./ResearchSite";
beforeEach(() => {
  cleanup();
  state.navigate.mockReset();
  state.search = { area: "overview", family: "", region: "FR" };
});
describe("research screens", () => {
  it.each(["overview", "explore", "insights", "method"] as const)(
    "renders %s with four navigation areas",
    (area) => {
      state.search.area = area;
      render(<ResearchSite />);
      expect(
        screen.getByRole("navigation", { name: "Main navigation" }).querySelectorAll("a"),
      ).toHaveLength(4);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    },
  );
  it.each(["soda", "biscuit", "pudding"] as const)(
    "renders %s in each geography with population context",
    (family) => {
      for (const region of ["FR", "UK-IE", "US-CA"] as const) {
        cleanup();
        state.search = { area: "explore", family, region };
        render(<ResearchSite />);
        expect(screen.getByText("Relevant assignments")).toBeTruthy();
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        if (region === "US-CA")
          expect(screen.getByText("Exploratory measurement subset.")).toBeTruthy();
      }
    },
  );
  it("shows the saved soda contrast with exact wording and denominators", () => {
    state.search = { area: "explore", family: "soda", region: "UK-IE" };
    render(<ResearchSite />);
    expect(screen.getByText(/28 \/ 43 proposition-known/)).toBeTruthy();
    expect(screen.getByText("62.8 percentage points")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Sugar-related communication" })).toBeTruthy();
  });
  it("withholds headline percentages for sparse pudding communication", () => {
    state.search = { area: "explore", family: "pudding", region: "UK-IE" };
    render(<ResearchSite />);
    expect(screen.getByText("Insufficient assessed evidence for comparison")).toBeTruthy();
    expect(screen.queryByText("100%")).toBeNull();
    expect(screen.getByText(/one known observation is positive/)).toBeTruthy();
  });
  it("changes geography without changing family", () => {
    state.search = { area: "explore", family: "biscuit", region: "FR" };
    render(<ResearchSite />);
    fireEvent.change(screen.getByLabelText("Geography"), { target: { value: "UK-IE" } });
    expect(state.navigate).toHaveBeenCalledWith({
      search: { area: "explore", family: "biscuit", region: "UK-IE" },
    });
  });
  it("keeps all four category entries usable", () => {
    state.search.area = "explore";
    render(<ResearchSite />);
    fireEvent.click(screen.getByRole("button", { name: "Cereals" }));
    expect(screen.getByRole("heading", { name: "Cereals in the accepted research" })).toBeTruthy();
  });
});

it("shows sourced pudding comparator medians without inventing absent summaries", () => {
  state.search = { area: "explore", family: "pudding", region: "UK-IE" };
  render(<ResearchSite />);
  expect(screen.getByText("3.4")).toBeTruthy();
  expect(screen.getByText("15.4")).toBeTruthy();
  expect(screen.getAllByText("Not supplied")).toHaveLength(2);
});
