import create from "zustand"

const useStore = create((set) => ({
  side: "A",
  playingState: 0,
  setSide: (side) => set((state) => ({ ...state, side })),
  setPlayingState: (playingState) =>
    set((state) => ({ ...state, playingState }))
}))

export default useStore
