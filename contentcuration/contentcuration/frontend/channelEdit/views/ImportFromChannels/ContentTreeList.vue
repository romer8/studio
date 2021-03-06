<template>

  <VContainer class="px-0 mx-0">
    <!-- Breadcrumbs -->
    <div>
      <Breadcrumbs :items="breadCrumbItems">
        <template #item="{item}">
          {{ item.text }}
        </template>
      </Breadcrumbs>
    </div>

    <!-- Main Area with Cards -->
    <VProgressLinear v-if="loading" indeterminate />
    <p v-else-if="nodes.length === 0">
      {{ $tr('noResourcesOrTopics') }}
    </p>
    <template v-else>
      <Checkbox
        v-model="selectAll"
        :disabled="ancestorIsSelected"
        :label="$tr('selectAllAction')"
      />
      <VLayout v-for="node in nodes" :key="node.id" row align-center>
        <VFlex shrink>
          <Checkbox
            :key="`checkbox-${node.id}`"
            :input-value="isSelected(node)"
            :disabled="ancestorIsSelected"
            @change="toggleSelected(node)"
          />
        </VFlex>
        <VFlex class="pa-4" grow>
          <BrowsingCard
            :ref="node.id"
            :node="node"
            :ancestorIsSelected="ancestorIsSelected"
            :inSearch="false"
            @preview="$emit('preview', node)"
            @click="toggleSelected(node)"
            @copy_to_clipboard="$emit('copy_to_clipboard', node)"
          />
        </VFlex>
      </VLayout>
    </template>
  </VContainer>

</template>


<script>

  import differenceBy from 'lodash/differenceBy';
  import intersectionBy from 'lodash/intersectionBy';
  import { mapActions, mapGetters } from 'vuex';
  import find from 'lodash/find';
  import { RouterNames } from '../../constants';
  import BrowsingCard from './BrowsingCard';
  import Breadcrumbs from 'shared/views/Breadcrumbs';
  import Checkbox from 'shared/views/form/Checkbox';
  import { constantsTranslationMixin } from 'shared/mixins';

  export default {
    name: 'ContentTreeList',
    components: {
      BrowsingCard,
      Breadcrumbs,
      Checkbox,
    },
    mixins: [constantsTranslationMixin],
    props: {
      selected: {
        type: Array,
        required: true,
      },
      topicId: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        loading: false,
        nodes: [],
      };
    },
    computed: {
      ...mapGetters('contentNode', ['getContentNodeAncestors', 'getTreeNode']),
      selectAll: {
        get() {
          return this.ancestorIsSelected || !differenceBy(this.nodes, this.selected, 'id').length;
        },
        set(isSelected) {
          this.$emit('change_selected', { isSelected, nodes: this.nodes });
        },
      },
      topicNode() {
        return this.getTreeNode(this.topicId);
      },
      isSelected() {
        return function(node) {
          if (this.ancestorIsSelected) {
            return true;
          }
          return Boolean(find(this.selected, { id: node.id }));
        }.bind(this);
      },
      ancestors() {
        return this.getContentNodeAncestors(this.topicId, true);
      },
      ancestorIsSelected() {
        return Boolean(intersectionBy(this.selected, this.ancestors, 'id').length);
      },
      breadCrumbItems() {
        const ancestorsLinks = this.ancestors.map(ancestor => {
          return {
            text: ancestor.title,
            to: {
              name: RouterNames.IMPORT_FROM_CHANNELS_BROWSE,
              params: {
                channelId: this.$route.params.channelId,
                nodeId: ancestor.id,
              },
            },
          };
        });
        return [
          {
            text: this.$tr('allChannelsLabel'),
            to: {
              name: RouterNames.IMPORT_FROM_CHANNELS_BROWSE,
              params: {},
            },
          },
          ...ancestorsLinks,
        ];
      },
    },
    watch: {
      topicId(parent) {
        this.loading = true;
        return this.loadChildren({
          parent,
          tree_id: this.topicNode.tree_id,
        }).then(nodes => {
          this.nodes = nodes;
          this.loading = false;
        });
      },
    },
    mounted() {
      this.loading = true;
      return this.loadChannelTree(this.$route.params.channelId).then(nodes => {
        return Promise.all([
          this.loadChildren({ parent: this.topicId, tree_id: nodes[0].tree_id }),
          this.loadAncestors({ id: this.topicId, includeSelf: true }),
        ]).then(([nodes]) => {
          this.nodes = nodes;
          this.loading = false;
        });
      });
    },
    methods: {
      ...mapActions('contentNode', ['loadChildren', 'loadAncestors', 'loadChannelTree']),
      // @public
      scrollToNode(nodeId) {
        const ref = this.$refs[nodeId];
        if (ref) {
          ref[0].$el.scrollIntoView(false);
          // HACK scroll down a little bit more to get whole card in view
          window.scroll(0, window.scrollY + 80);
        }
      },
      toggleSelected(node) {
        this.$emit('change_selected', { nodes: [node], isSelected: !this.isSelected(node) });
      },
    },
    $trs: {
      allChannelsLabel: 'Channels',
      noResourcesOrTopics: 'There are no resources or topics here',
      selectAllAction: 'Select all',
    },
  };

</script>


<style lang="scss" scoped></style>
