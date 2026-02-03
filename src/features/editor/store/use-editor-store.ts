import { create } from "zustand";
import { Id } from "convex/_generated/dataModel";

interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>;

  getTabState: (projectId: Id<"projects">) => TabState;

  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options: { pinned: boolean },
  ) => void;

  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;

  closeAllTabs: (projectId: Id<"projects">) => void;

  //   closeTabsLeftOf: (projectId: Id<"projects">, fileId: Id<"files">) => void;

  //   closeTabsRightOf: (projectId: Id<"projects">, fileId: Id<"files">) => void;

  //   closeTabsToTheRight: (projectId: Id<"projects">, fileId: Id<"files">) => void;

  //   closeTabsToTheLeft: (projectId: Id<"projects">, fileId: Id<"files">) => void;

  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
  //   setPreviewTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: new Map(),

  getTabState: (projectId) => {
    const state = get();
    return state.tabs.get(projectId) ?? defaultTabState;
  },

  openFile: (projectId, fileId, options) => {
    const state = get();
    const tabState = state.getTabState(projectId);
    const { openTabs, previewTabId } = tabState;
    const isOpen = openTabs.includes(fileId);

    // CASE 1: oPENING AS A PREVIEW - REPLACE EXISTING PREVIEW OR ADD NEW
    if (!options.pinned && !isOpen) {
      const newTabs = previewTabId
        ? openTabs.map((id) => (id === previewTabId ? fileId : id))
        : [...openTabs, fileId];

      state.tabs.set(projectId, {
        ...tabState,
        openTabs: newTabs,
        previewTabId: fileId,
        activeTabId: fileId,
      });
      set({ tabs: state.tabs });
      return;
    }

    // CASE 2: OPEN AS PINNED TAB - ADD NEW TAB
    if (options.pinned && !isOpen) {
      state.tabs.set(projectId, {
        ...tabState,
        openTabs: [fileId, ...openTabs],
        activeTabId: fileId,
      });
      set({ tabs: state.tabs });
      return;
    }

    // CASE 3: FILE ALREADY OPEN - SET AS ACTIVE AND PIN IF DOUBLE CLICKED
    const shouldPin = options.pinned && previewTabId === fileId;
    if (isOpen) {
      state.tabs.set(projectId, {
        ...tabState,
        //   openTabs: [fileId, ...openTabs],
        activeTabId: fileId,
        previewTabId: shouldPin ? null : previewTabId,
      });
      set({ tabs: state.tabs });
      return;
    }
  },

  setActiveTab: (projectId, fileId) => {
    const state = get();
    const tabState = state.getTabState(projectId);
    const { openTabs } = tabState;

    if (openTabs.includes(fileId)) {
      state.tabs.set(projectId, {
        ...tabState,
        activeTabId: fileId,
      });
      set({ tabs: state.tabs });
    }
  },

  closeTab: (projectId, fileId) => {
    const state = get();
    const tabState = state.getTabState(projectId);
    const { openTabs, activeTabId, previewTabId } = tabState;
    const tabsIndex = openTabs.indexOf(fileId);
    const isOpen = tabsIndex !== -1;

    if (!isOpen) return;

    const newTabs = openTabs.filter((id) => id !== fileId);
    let newActiveTabId = activeTabId;

    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabsIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        newActiveTabId = newTabs[tabsIndex];
      }
    }

    state.tabs.set(projectId, {
      ...tabState,
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    });
    set({ tabs: state.tabs });
  },

  closeAllTabs: (projectId) => {
    const state = get();
    state.tabs.set(projectId, defaultTabState);
    set({ tabs: state.tabs });
  },
}));
