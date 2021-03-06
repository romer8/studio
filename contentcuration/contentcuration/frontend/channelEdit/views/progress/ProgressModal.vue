<template>

  <div>
    <VDialog
      v-if="currentTask && !currentTask.noDialog"
      :value="true"
      persistent
      :width="575"
      attach="body"
      data-test="progressmodal"
    >
      <VCard class="pa-3">
        <VWindow v-model="step">
          <VWindowItem :value="1">
            <VCardTitle class="pb-0 title font-weight-bold">
              {{ headerText }}
            </VCardTitle>
            <VCardText class="py-4">
              <ProgressBar :text="descriptionText" />
            </VCardText>

            <VCardActions>
              <VSpacer />
              <VBtn
                v-if="progressPercent === 100 || currentTaskError"
                color="primary"
                data-test="refresh"
                @click="closeOverlay"
              >
                {{ doneButtonText || $tr('refreshButton') }}
              </VBtn>
              <VBtn v-else color="primary" data-test="stop" @click="step++">
                {{ stopButtonText || $tr('stopButton') }}
              </VBtn>
            </VCardActions>
          </VWindowItem>

          <VWindowItem :value="2">
            <VCardTitle class="pb-0 title font-weight-bold">
              {{ cancelHeaderText || $tr('cancelHeader') }}
            </VCardTitle>
            <VCardText class="py-4">
              {{ cancelText || $tr('cancelText') }}
            </VCardText>

            <VCardActions>
              <VSpacer />
              <VBtn flat data-test="cancelstop" @click="step--">
                {{ $tr('cancel') }}
              </VBtn>
              <VBtn color="primary" data-test="confirmstop" @click="cancelTask">
                {{ stopButtonText || $tr('confirmStopButton') }}
              </VBtn>
            </VCardActions>
          </VWindowItem>
        </VWindow>
      </VCard>
    </VDialog>

  </div>

</template>

<script>

  import { mapActions, mapGetters } from 'vuex';
  import ProgressBar from './ProgressBar.vue';

  export default {
    name: 'ProgressModal',
    components: {
      ProgressBar,
    },
    props: {
      doneButtonText: {
        type: String,
        default: '',
      },
      stopButtonText: {
        type: String,
        default: '',
      },
      cancelHeaderText: {
        type: String,
        default: '',
      },
      cancelText: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        step: 1,
      };
    },
    computed: {
      ...mapGetters('task', ['currentTask', 'currentTaskError', 'progressPercent']),
      headerText() {
        if (this.currentTask.task_type === 'duplicate-nodes') {
          return this.$tr('copyHeader');
        } else if (this.currentTask.task_type === 'export-channel') {
          return this.$tr('publishHeader');
        } else if (this.currentTask.task_type === 'move-nodes') {
          return this.$tr('moveHeader');
        } else if (
          this.currentTask.task_type === 'sync-channel' ||
          this.currentTask.task_type === 'sync-nodes'
        ) {
          return this.$tr('syncHeader');
        } else {
          return this.$tr('defaultHeader');
        }
      },
      descriptionText() {
        if (this.currentTaskError) {
          return this.$tr('defaultErrorText');
        } else if (this.progressPercent >= 100) {
          return this.$tr('finishedMessage');
        } else if (this.currentTask.task_type === 'duplicate-nodes') {
          return this.$tr('copyDescription');
        } else if (this.currentTask.task_type === 'export-channel') {
          return this.$tr('publishDescription');
        } else if (this.currentTask.task_type === 'move-nodes') {
          return this.$tr('moveDescription');
        } else if (
          this.currentTask.task_type === 'sync-channel' ||
          this.currentTask.task_type === 'sync-nodes'
        ) {
          return this.$tr('syncDescription');
        } else {
          return this.$tr('defaultDescription');
        }
      },
    },
    methods: {
      ...mapActions('task', ['deactivateTaskUpdateTimer', 'deleteCurrentTask']),
      closeOverlay() {
        window.location.reload();
        // We keep the task set to make sure the overlay stays up,
        // so explicitly turn off the task checking timer while we wait
        // for refresh.
        this.deactivateTaskUpdateTimer();
      },
      cancelTask() {
        this.deleteCurrentTask();
        this.closeOverlay();
      },
    },
    $trs: {
      copyHeader: 'Copying Content',
      copyDescription: 'Copy operation is in progress, please wait...',
      defaultHeader: 'Updating Channel',
      defaultDescription: 'Update is in progress, please wait...',
      defaultErrorText:
        'An unexpected error has occurred. Please try again, and if you continue to see this message, please contact support via the Help menu.',
      finishedMessage: 'Operation complete! Click "Refresh" to update the page.',
      moveHeader: 'Moving Content',
      moveDescription: 'Move operation is in progress, please wait...',
      publishHeader: 'Publishing Channel',
      publishDescription:
        'Please wait for publishing to finish to make further edits. You will receive an email notice once channel publishing is complete.',
      syncHeader: 'Syncing Content',
      syncDescription: 'Content sync operation is in progress, please wait...',
      stopButton: 'Stop',
      refreshButton: 'Refresh',
      cancel: 'No, go back',
      confirmStopButton: 'Yes, stop task',
      cancelHeader: 'Are you sure?',
      cancelText: 'Are you sure you would like to cancel this task?',
    },
  };

</script>
