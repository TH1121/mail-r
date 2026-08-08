<template>
  <emailScroll ref="scroll"
               :allow-star="false"
               :getEmailList="getEmailList"
               :emailDelete="physicsDelete"
               :email-read="noop"
               :star-add="noop"
               :star-cancel="noop"
               :time-sort="params.timeSort"
               actionLeft="4px"
               :showStar="false"
               :type="'trash'"
               @jump="jumpContent"
  >
    <template #first>
      <el-tooltip :content="$t('trashHint')" placement="top">
        <span class="trash-hint">{{ $t('trashHint') }}</span>
      </el-tooltip>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-down-outline"
            v-if="params.timeSort === 0" width="28" height="28"/>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-up-outline" v-else
            width="28" height="28"/>
    </template>
  </emailScroll>
</template>

<script setup>
import {useAccountStore} from "@/store/account.js";
import {useEmailStore} from "@/store/email.js";
import emailScroll from "@/components/email-scroll/index.vue"
import {emailTrashList, emailPhysicsDelete} from "@/request/email.js";
import {defineOptions, reactive, ref, watch} from "vue";
import router from "@/router/index.js";
import {Icon} from "@iconify/vue";
import {useI18n} from "vue-i18n";
import {ElMessageBox} from "element-plus";

defineOptions({
  name: 'trash'
})

const {t} = useI18n()
const emailStore = useEmailStore();
const accountStore = useAccountStore();
const scroll = ref({})
const params = reactive({
  timeSort: 0,
})

watch(() => accountStore.currentAccountId, () => {
  scroll.value?.refreshList?.();
})

function noop() {
  return Promise.resolve()
}

function changeTimeSort() {
  params.timeSort = params.timeSort ? 0 : 1
  scroll.value.refreshList();
}

function jumpContent(email) {
  emailStore.contentData.email = email
  emailStore.contentData.delType = 'trash'
  emailStore.contentData.showStar = false
  emailStore.contentData.showReply = false
  emailStore.contentData.showUnread = false
  router.push('/message')
}

function physicsDelete(ids) {
  return ElMessageBox.confirm(t('physicsDeleteConfirm'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => emailPhysicsDelete(ids))
}

function getEmailList(emailId, size) {
  const accountId = accountStore.currentAccountId;
  const allReceive = accountStore.currentAccount?.allReceive ?? 1;
  return emailTrashList(accountId, allReceive, emailId, params.timeSort, size)
}
</script>

<style scoped>
.trash-hint {
  font-size: 12px;
  color: var(--secondary-text-color);
  margin-right: 8px;
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
