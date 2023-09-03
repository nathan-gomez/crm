import { create } from 'zustand'

type UserState = {
  username: string | null;
  role: string | null;
}

type UserAction = {
  updateUser: (user: UserState) => void
}

type UserStore = UserState & { actions: UserAction }

const userStore = create<UserStore>()((set) => ({
  username: null,
  role: null,
  actions: {
    updateUser: (user) => set(() => (user)),
  }
}))

export default userStore
