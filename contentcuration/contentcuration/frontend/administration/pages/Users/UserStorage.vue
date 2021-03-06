<template>

  <VForm ref="form" lazy-validation @submit.prevent="submit">
    <VLayout row wrap>
      <VFlex style="max-width: 148px;">
        <VTextField
          v-model="space"
          label="Size"
          single-line
          type="number"
          reverse
          outline
          class="mr-2"
          min="0"
          required
          :rules="spaceRules"
        />
      </VFlex>
      <VFlex style="max-width: 75px;">
        <VSelect
          v-model="unit"
          :items="unitOptions"
          :menuProps="{offsetY: true}"
          outline
          single-line
          required
          :rules="unitRules"
        />
      </VFlex>
    </VLayout>
    <VBtn
      v-if="showCancel"
      flat
      class="ma-0 mr-4"
      data-test="cancel"
      @click="cancel"
    >
      Cancel
    </VBtn>
    <VBtn
      class="ma-0"
      color="primary"
      type="submit"
      data-test="submit"
    >
      Save changes
    </VBtn>
  </VForm>

</template>


<script>

  import { mapActions } from 'vuex';
  import findLastKey from 'lodash/findLastKey';
  import { ONE_B, ONE_KB, ONE_MB, ONE_GB, ONE_TB } from 'shared/constants';

  const units = {
    ONE_B,
    ONE_KB,
    ONE_MB,
    ONE_GB,
    ONE_TB,
  };

  export default {
    name: 'UserStorage',
    props: {
      value: {
        type: Number,
        required: true,
      },
      userId: {
        type: String,
        required: true,
      },
      showCancel: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        space: 0,
        unit: 'ONE_MB',
      };
    },
    computed: {
      unitOptions() {
        return [
          { value: 'ONE_B', text: 'B' },
          { value: 'ONE_KB', text: 'KB' },
          { value: 'ONE_MB', text: 'MB' },
          { value: 'ONE_GB', text: 'GB' },
          { value: 'ONE_TB', text: 'TB' },
        ];
      },
      spaceRules() {
        return [
          v => v !== '' || 'This field is required',
          v => v >= 0 || 'Must be greater than or equal to 0',
        ];
      },
      unitRules() {
        return [v => Boolean(v) || 'This field is required'];
      },
    },
    mounted() {
      this.unit = findLastKey(units, u => this.value >= u);
      this.space = this.value / units[this.unit];
    },
    methods: {
      ...mapActions('userAdmin', ['updateUser']),
      submit() {
        if (this.$refs.form.validate()) {
          return this.updateUser({
            id: this.userId,
            disk_space: Number(this.space) * units[this.unit],
          }).then(() => {
            this.$emit('close');
            this.$store.dispatch('showSnackbarSimple', 'Changes saved');
          });
        } else {
          return Promise.resolve();
        }
      },
      cancel() {
        this.unit = findLastKey(units, u => this.value >= u);
        this.space = this.value / units[this.unit];
        this.$emit('close');
      },
    },
  };

</script>
