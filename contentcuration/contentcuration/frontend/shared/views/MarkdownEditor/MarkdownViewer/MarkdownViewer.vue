<template>

  <div>
    <div ref="viewer"></div>
  </div>

</template>

<script>

  import '@toast-ui/editor/dist/toastui-editor-viewer.css';
  import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';

  import '../mathquill/mathquill.js';
  import { CLASS_MATH_FIELD } from '../constants';
  import formulaMdToHtml from '../plugins/formulas/formula-md-to-html.js';

  export default {
    name: 'MarkdownViewer',
    props: {
      markdown: {
        type: String,
      },
    },
    data() {
      return {
        viewer: null,
        mathQuill: null,
      };
    },
    watch: {
      markdown(newMd, previousMd) {
        if (newMd !== previousMd) {
          this.viewer.setMarkdown(newMd);
          this.initStaticMathFields();
        }
      },
    },
    mounted() {
      this.mathQuill = MathQuill.getInterface(2);

      this.viewer = new Viewer({
        el: this.$refs.viewer,
        height: 'auto',
        initialValue: this.markdown,
        customHTMLRenderer: {
          text(node) {
            return {
              type: 'html',
              content: formulaMdToHtml(node.literal),
            };
          },
        },
      });

      this.initStaticMathFields();
    },
    methods: {
      initStaticMathFields() {
        const mathFieldEls = this.$el.getElementsByClassName(CLASS_MATH_FIELD);
        for (let mathFieldEl of mathFieldEls) {
          this.mathQuill.StaticMath(mathFieldEl);
        }
      },
    },
  };

</script>

<style lang="less" scoped>

  @import '../mathquill/mathquill.css';

  .math-field {
    font-family: Symbola;
  }

</style>
