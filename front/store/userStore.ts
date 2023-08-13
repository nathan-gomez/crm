import { create } from 'zustand'

type UserState = {
  // user: {
  username: string;
  userId: string;
  role: string;
  // } | null
}

type UserAction = {
  updateUser: (user: UserState) => void
}

type UserStore = UserState & { actions: UserAction }

const userStore = create<UserStore>()((set) => ({
  username: '',
  userId: '',
  role: '',
  actions: {
    updateUser: (user) => set(() => (user)),
  }
}))

export default userStore