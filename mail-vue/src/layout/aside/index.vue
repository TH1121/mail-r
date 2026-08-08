<template>
  <el-scrollbar class="scroll">
    <div class="aside-inner">
      <div class="title">
        <Icon icon="mdi:email-outline" width="22" height="22" />
        <div>{{settingStore.settings.title}}</div>
      </div>
      <button
          v-perm="'email:send'"
          type="button"
          class="compose-btn"
          @click="openCompose"
      >
        <Icon icon="material-symbols:edit-outline-sharp" width="18" height="18"/>
        <span>{{ $t('composeMail') }}</span>
      </button>
      <el-menu :collapse="false" text-color="rgba(255,255,255,0.82)" active-text-color="#fff" class="aside-menu">
        <el-menu-item @click="router.push({name: 'email'})" index="email"
                      :class="route.meta.name === 'email' ? 'choose-item' : ''">
          <Icon icon="hugeicons:mailbox-01" width="20" height="20" />
          <span class="menu-name">{{$t('inbox')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'send'})" index="send" v-perm="'email:send'"
                      :class="route.meta.name === 'send' ? 'choose-item' : ''">
          <Icon icon="cil:send" width="20" height="20" />
          <span class="menu-name">{{$t('sent')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'draft'})" index="draft" v-perm="'email:send'"
                      :class="route.meta.name === 'draft' ? 'choose-item' : ''">
          <Icon icon="ep:document" width="19" height="19" />
          <span class="menu-name">{{$t('drafts')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'star'})" index="star"
                      :class="route.meta.name === 'star' ? 'choose-item' : ''">
          <Icon icon="solar:star-line-duotone" width="20" height="20" />
          <span class="menu-name">{{$t('starred')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'setting'})" index="setting"
                      :class="route.meta.name === 'setting' ? 'choose-item' : ''">
          <Icon icon="fluent:settings-48-regular" width="20" height="20" />
          <span class="menu-name">{{$t('settings')}}</span>
        </el-menu-item>
        <div class="manage-title" v-perm="['all-email:query','user:query','role:query','setting:query','analysis:query','reg-key:query']">
          <div>{{$t('manage')}}</div>
        </div>
        <el-menu-item @click="router.push({name: 'analysis'})" index="analysis" v-perm="'analysis:query'"
                      :class="route.meta.name === 'analysis' ? 'choose-item' : ''">
          <Icon icon="fluent:data-pie-20-regular" width="24" height="24" />
          <span class="menu-name">{{$t('analytics')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'user'})" index="setting" v-perm="'user:query'"
                      :class="route.meta.name === 'user' ? 'choose-item' : ''">
          <Icon icon="si:user-alt-2-line" width="20" height="20" />
          <span class="menu-name">{{$t('allUsers')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'all-email'})" index="all-email" v-perm="'all-email:query'"
                      :class="route.meta.name === 'all-email' ? 'choose-item' : ''">
          <Icon icon="fluent:mail-list-28-regular" width="22" height="22" />
          <span class="menu-name">{{$t('allMail')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'role'})" index="setting" v-perm="'role:query'"
                      :class="route.meta.name === 'role' ? 'choose-item' : ''">
          <Icon icon="fluent:lock-closed-16-regular" width="22" height="22" />
          <span class="menu-name">{{$t('permissions')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'reg-key'})" index="reg-key" v-perm="'reg-key:query'"
                      :class="route.meta.name === 'reg-key' ? 'choose-item' : ''">
          <Icon icon="fluent:fingerprint-20-filled" width="22" height="22" />
          <span class="menu-name">{{$t('inviteCode')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'sys-setting'})" index="sys-setting" v-perm="'setting:query'"
                      :class="route.meta.name === 'sys-setting' ? 'choose-item' : ''">
          <Icon icon="eos-icons:system-ok-outlined" width="18" height="18" style="margin-left: 2px" />
          <span class="menu-name">{{$t('SystemSettings')}}</span>
        </el-menu-item>
      </el-menu>
    </div>
  </el-scrollbar>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/store/setting.js";
import {useUiStore} from "@/store/ui.js";

const settingStore = useSettingStore();
const uiStore = useUiStore();
const route = useRoute();

function openCompose() {
  uiStore.writerRef?.open?.()
}
</script>

<style lang="scss" scoped>

.aside-inner {
  padding-bottom: 16px;
}

.title {
  margin: 18px 14px 10px;
  height: 40px;
  display: flex;
  position: relative;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  max-width: 240px;
  padding: 0 8px;

  > div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: calc(240px - 20px - 30px);
  }

  :deep(.el-icon) {
    flex-shrink: 0;
    font-size: 20px;
    opacity: 0.95;
  }
}

.compose-btn {
  margin: 4px 14px 14px;
  width: calc(100% - 28px);
  max-width: 232px;
  height: 40px;
  border: none;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b9eff 0%, #1677ff 100%);
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &:hover {
    filter: brightness(1.05);
    box-shadow: 0 8px 18px rgba(22, 119, 255, 0.34);
  }

  &:active {
    transform: translateY(1px);
  }
}

.manage-title {
  margin: 14px 14px 6px;
  padding-left: 8px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.aside-menu {
  margin-top: 2px;
}

.el-menu-item {
  margin: 3px 10px !important;
  border-radius: 10px;
  height: 38px;
  padding: 0 12px !important;
  gap: 0;
}

.choose-item {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.12) !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

@media (hover: hover) {
  .el-menu-item:hover {
    background: rgba(255, 255, 255, 0.08) !important;
  }
}

.menu-name {
  user-select: none;
  margin-left: 14px;
}


:deep(.el-scrollbar__wrap--hidden-default ) {
  background: var(--aside-backgound) !important;
}

:deep(.el-menu-item) {
  background: transparent;
}

:deep(.el-menu) {
  background: transparent;
}

.el-menu {
  border-right: 0;
  width: 260px;
}

:deep(.el-divider__text) {
  background: var(--aside-backgound);
  color: #FFFFFF;
}

.scroll {

}
</style>
