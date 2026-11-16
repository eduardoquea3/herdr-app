import { View, div, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { layout, openOverlay, run, spaces, theme } from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class ZedSpaceTabs extends View {
  init() {
    this.collapsedSpaces = new Set(JSON.parse(localStorage.getItem("zed-space-tabs.collapsed") ?? "[]"));
  }

  toggleSpace(id, cx) {
    if (this.collapsedSpaces.has(id)) this.collapsedSpaces.delete(id);
    else this.collapsedSpaces.add(id);
    localStorage.setItem("zed-space-tabs.collapsed", JSON.stringify([...this.collapsedSpaces]));
    cx.notify();
  }

  selectTab(space, tab) {
    run("space.select", { id: space.id });
    run("tab.select", { id: tab.id });
  }

  panelButton(id, label, icon, t) {
    const tree = layout();
    const panel = find(tree, "panel");
    const body = find(tree, "panel-body");
    const active = panel && !panel.hidden && body?.active === id;
    return h_flex().id(`panel-${id}`).h(30).px(10).gap(8).items_center().rounded(6).flex_none()
      .bg(active ? t.selected : t.chrome).text_color(active ? t.foreground : t.muted)
      .hover(el => el.bg(t.hover).text_color(t.foreground))
      .on_click(() => {
        if (active) run("layout.hide", { id: "panel" });
        else {
          run("layout.select", { stack: "panel-body", child: id });
          run("layout.show", { id: "panel" });
        }
      })
      .child(svg(`mods/workspace-chrome/${icon}.svg`).size(14))
      .child(label);
  }

  render() {
    const t = theme();
    const list = spaces();
    const tabRow = (space, tab) => h_flex().id(`tab-${tab.id}`).h(29).pl(34).pr(10).gap(8).items_center().flex_none()
      .bg(tab.active ? t.selected : t.chrome)
      .text_color(tab.active ? t.foreground : tab.settled ? t.dim : t.muted)
      .hover(el => el.bg(t.hover).text_color(t.foreground))
      .on_click(() => this.selectTab(space, tab))
      .child(div().w(14).flex_none().text_color(tab.status ? (t[tab.status] ?? t.muted) : t.dim)
        .child(tab.status === "working" ? "●" : tab.status === "blocked" || tab.status === "done" ? "●" : tab.settled ? "◌" : "·"))
      .child(div().flex_1().min_w(0).truncate().child(tab.name || `Tab ${tab.index}`))
      .when(tab.zoomed, el => el.child(div().text_color(t.dim).child("Z")));

    const spaceRow = (space) => {
      const expanded = !this.collapsedSpaces.has(space.id);
      return v_flex().id(`space-${space.id}`).flex_none()
        .child(h_flex().id(`space-row-${space.id}`).h(32).px(8).gap(7).items_center().flex_none()
          .bg(space.active ? t.selected : t.chrome)
          .text_color(space.active ? t.foreground : t.muted)
          .hover(el => el.bg(t.hover).text_color(t.foreground))
          .on_click(() => run("space.select", { id: space.id }))
          .child(div().id(`fold-${space.id}`).size(20).flex_none().flex().items_center().justify_center()
            .text_color(t.dim).on_click((_event, cx) => {
              cx.stop_propagation();
              this.toggleSpace(space.id, cx);
            }).child(expanded ? "▾" : "▸"))
          .child(svg(space.machine ? "mods/workspace-chrome/server.svg" : "mods/workspace-chrome/folder.svg").size(14).flex_none())
          .child(div().flex_1().min_w(0).truncate().child(space.name))
          .child(div().text_color(t.dim).text_size(10).child(String(space.tabs.length))))
        .when(expanded, el => el.children(space.tabs.map(tab => tabRow(space, tab))));
    };

    const plus = h_flex().id("new-space").size(28).flex_none().items_center().justify_center().rounded(6)
      .text_color(t.muted).hover(el => el.bg(t.hover).text_color(t.foreground))
      .on_click(() => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 }))
      .child(svg("mods/workspace-chrome/plus.svg").size(14));

    return v_flex().id("zed-space-tabs-root").size_full().min_h(0).bg(t.chrome)
      .child(h_flex().h(40).px(12).gap(8).items_center().flex_none().border_b(1).border_color(t.border)
        .child(div().flex_1().font_semibold().text_size(11).text_color(t.muted).child("SPACES"))
        .child(plus))
      .child(v_flex().id("space-tab-list").flex_1().min_h(0).overflow_y_scrollbar().py(6)
        .when(list.length === 0, el => el.child(div().px(14).py(10).text_size(11).text_color(t.dim).child("No spaces")))
        .children(list.map(spaceRow)))
      .child(h_flex().h(38).px(8).gap(6).items_center().flex_none().border_t(1).border_color(t.border)
        .child(this.panelButton("files", "Files", "files", t))
        .child(this.panelButton("changes", "Changes", "git-compare", t)));
  }
}
