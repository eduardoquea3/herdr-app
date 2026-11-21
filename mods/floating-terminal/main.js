import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import {
  checking, closeOverlay, focused, hc, home, notify, openOverlay, panes,
  props, run, setShared, shared, spaces, theme,
} from "herdr";

const STATE_KEY = "floating-terminal.windows";

function windows() {
  const value = shared(STATE_KEY);
  return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

function folderFor(space) {
  const current = focused();
  if (current?.space === space.id && current.cwd) return current.cwd;

  const tabIds = new Set(space.tabs.map((tab) => tab.id));
  return panes().find((pane) => tabIds.has(pane.tab) && pane.cwd)?.cwd
    || space.folder
    || (space.machine ? "" : home());
}

function closeController(id) {
  if (id) closeOverlay(id);
}

function titleFor(folder) {
  return folder?.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || "Home";
}

export default class FloatingTerminal extends View {
  init(_props, cx) {
    const p = props() ?? {};
    if (checking() || p.part === "titlebar") return;

    const space = spaces().find((item) => item.active);
    if (!space) {
      notify({ title: "Floating terminal", body: "There is no active space.", level: "warning" });
      closeController(p.overlay);
      return;
    }

    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.pending = { spaceId: space.id, token };
    cx.spawn(async () => this.toggle(space, token, p.overlay));
  }

  async toggle(space, token, controllerOverlay) {
    const open = windows()[space.id];
    if (open?.status === "open" && open.overlay) {
      closeOverlay(open.overlay);
      closeController(controllerOverlay);
      return;
    }

    const machine = space.machine || null;
    const folder = folderFor(space);
    const state = windows();
    state[space.id] = { status: "starting", token, folder, machine };
    setShared(STATE_KEY, state);

    try {
      const args = ["run", "--bg", "--json", "--no-parent"];
      if (machine) args.push("--on", machine);
      if (folder) args.push("--cwd", folder);

      const result = await hc(args);
      if (result.code !== 0) {
        throw new Error(result.stderr.trim() || result.stdout.trim() || `hc exited with ${result.code}`);
      }

      let address = JSON.parse(result.stdout).address;
      if (!address) throw new Error("herdr-core did not return a terminal address.");
      if (machine && !address.includes("/")) address = `${machine}/${address}`;

      const latest = windows();
      if (latest[space.id]?.token !== token || latest[space.id]?.cancelled) {
        await hc(["kill", address]).catch(() => null);
        return;
      }

      const overlay = openOverlay({
        kind: "window",
        key: `floating-terminal-${space.id}`,
        width: 800,
        height: 500,
        layout: {
          type: "column",
          children: [
            {
              id: "floating-terminal-title",
              type: "block",
              size: { px: 32 },
              content: {
                mod: "floating-terminal",
                props: { part: "titlebar", spaceId: space.id, terminal: address, folder },
              },
            },
            {
              id: "floating-terminal-body",
              type: "block",
              content: { terminal: address },
            },
          ],
        },
      });

      const next = windows();
      next[space.id] = { status: "open", token, overlay, terminal: address, folder, machine };
      setShared(STATE_KEY, next);
    } catch (error) {
      const next = windows();
      if (next[space.id]?.token === token) {
        delete next[space.id];
        setShared(STATE_KEY, next);
      }
      notify({
        title: "Could not open floating terminal",
        body: String(error?.message ?? error),
        level: "error",
      });
    } finally {
      closeController(controllerOverlay);
    }
  }

  render() {
    const p = props() ?? {};
    if (p.part !== "titlebar") return div().size(1);

    const t = theme();
    const label = titleFor(p.folder);
    return h_flex().id("floating-terminal-title").size_full().px(10).items_center().justify_between()
      .bg(t.chrome).border_b(1).border_color(t.border).text_size(12)
      .child(div().flex_1().min_w(0).truncate().text_color(t.foreground).child(`Terminal · ${label}`))
      .child(div().id("floating-terminal-close").size(22).flex_none().flex().items_center().justify_center()
        .rounded(5).text_color(t.muted).hover((s) => s.bg(t.hover).text_color(t.foreground))
        .on_mouse_down("left", (_event, cx) => cx.stop_propagation())
        .on_click((_event, cx) => {
          cx.stop_propagation();
          closeOverlay(p.overlay);
        })
        .child("×"));
  }

  close() {
    if (checking()) return;
    const p = props() ?? {};
    const state = windows();

    if (p.part === "titlebar") {
      const current = state[p.spaceId];
      if (current?.terminal === p.terminal) {
        delete state[p.spaceId];
        setShared(STATE_KEY, state);
      }
      if (p.terminal) run("terminal.kill", { terminal: p.terminal });
      return;
    }

    const pending = this.pending;
    const current = pending && state[pending.spaceId];
    if (current?.token === pending.token && current.status === "starting") {
      state[pending.spaceId] = { ...current, cancelled: true };
      setShared(STATE_KEY, state);
    }
  }
}
