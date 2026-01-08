// src/stores/userStore.js (النسخة المحصنة)
import { defineStore } from 'pinia'
import userService from '@/services/userService'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    user: null,
    pagination: {},
    loading: false,
  }),

  actions: {
    async fetchUsers(page = 1) {
      this.loading = true
      try {
        const response = await userService.get(page)
        // [تحصين]
        this.users = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch users:', error)
        this.users = [] // إجراء وقائي
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOneUser(id) {
      this.loading = true
      try {
        const response = await userService.find(id)
        this.user = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch user ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(payload) {
      try {
        await userService.create(payload)
      } catch (error) {
        console.error('Failed to create user:', error)
        throw error // أعد رمي الخطأ ليتم التعامل معه في المكون
      }
    },

    async updateUser(id, payload) {
      try {
        await userService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update user ${id}:`, error)
        throw error // أعد رمي الخطأ
      }
    },

    async deleteUser(id) {
      try {
        await userService.delete(id)
        // [تحسين] نعتمد على fetchUsers لتحديث القائمة لضمان التزامن
      } catch (error) {
        console.error(`Failed to delete user ${id}:`, error)
        throw error // أعد رمي الخطأ
      }
    },
  },
})
