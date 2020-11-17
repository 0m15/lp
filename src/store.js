import create from "zustand"

const useStore = create((set) => ({
  side: "A",
  setSide: (side) => set((state) => ({ side }))
}))

export default useStore
