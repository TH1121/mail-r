<template>
  <emailScroll ref="scroll"
               :allow-star="false"
               :getEmailList="getEmailList"
               :emailDelete="cancelSchedule"
               :star-add="noop"
               :star-cancel="noop"
               actionLeft="6px"
               :show-account-icon="false"
               :showStar="false"
               :show-status="true"
               :type="'schedule'"
  >
    <template #name="props">
      <span class="send-email">{{ formatRecipients(props.email) }}</span>
    </template>
    <template #subject="props">
      <span>{{ props.email.subject || '(' + $t('noSubject') + ')' }}</span>
      <el-tag v-if="props.email.status === 1" type="danger" size="small" style="margin-left: 8px">{{ $t('scheduleFailed') }}</el-tag>
    </template>
    <template #first>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-down-outline"
            v-if="params.timeSort === 0" width="28" height="28"/>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-up-outline" v-else
            width="28" height="28"/>
    </template>
  </emailScroll>
</template>

<script setup>
import emailScroll from "@/components/email-scroll/index.vue"
import {scheduleList, scheduleCancel} from "@/request/email.js";
import {defineOptions, reactive, ref} from "vue";
import {Icon} from "@iconify/vue";
import {useI18n} from "vue-i18n";
import dayjs from "dayjs";

defineOptions({
  name: 'schedule'
})

const {t} = useI18n()
const scroll = ref({})
const params = reactive({
  timeSort: 0,
})

function noop() {
  return Promise.resolve()
}

function changeTimeSort() {
  params.timeSort = params.timeSort ? 0 : 1
  scroll.value.refreshList();
}

function formatRecipients(email) {
  const list = Array.isArray(email.receiveEmail) ? email.receiveEmail : []
  return list.join(',') || '(' + t('noRecipient') + ')'
}

function cancelSchedule(ids) {
  return scheduleCancel(ids)
}

function getEmailList(emailId, size) {
  return scheduleList(emailId, params.timeSort, size).then(data => {
    data.list = (data.list || []).map(item => ({
      ...item,
      name: formatRecipients(item),
      sendEmail: item.sendEmail,
      createTime: item.sendAt,
      timeLabel: dayjs(item.sendAt).format('YYYY-MM-DD HH:mm')
    }))
    return data
  })
}
</script>
