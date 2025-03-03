<template>
  <div>
    <div v-if="showLabel" :class="labelClasses">
      {{ df.label }}
    </div>
    <input
      v-show="showInput"
      ref="input"
      class="text-end"
      :class="[inputClasses, containerClasses]"
      :type="inputType"
      :value="round(value)"
      :placeholder="inputPlaceholder"
      :readonly="isReadOnly"
      :tabindex="isReadOnly ? '-1' : '0'"
      @blur="onBlur"
      @focus="onFocus"
      @input="(e:Event) => $emit('input', e)"
    />
    <div
      v-show="!showInput"
      class="whitespace-nowrap overflow-x-auto no-scrollbar"
      :class="[inputClasses, containerClasses]"
      tabindex="0"
      @click="activateInput"
      @focus="activateInput"
    >
      {{ formattedValue }}
    </div>
  </div>
</template>
<script lang="ts">
import { isPesa } from 'fyo/utils';
import { Money } from 'pesa';
import { fyo } from 'src/initFyo';
import { safeParsePesa } from 'utils/index';
import { defineComponent, nextTick } from 'vue';
import Float from './Float.vue';

export default defineComponent({
  name: 'Currency',
  extends: Float,
  emits: ['input', 'focus'],
  data() {
    return {
      showInput: false,
      currencySymbol: '',
    };
  },
  props: {
    focusInput: Boolean,
  },
  created() {
    if (this.focusInput) {
      this.showInput = true;
      nextTick(() => {
        this.focus();
      });
    }
  },
  computed: {
    formattedValue() {
      const value = this.parse(this.value);
      return fyo.format(value, this.df, this.doc);
    },
  },
  methods: {
    onFocus(e: FocusEvent) {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      target.select();
      this.showInput = true;
      this.$emit('focus', e);
    },
    round(v: unknown) {
      if (!isPesa(v)) {
        v = this.parse(v);
      }

      if (isPesa(v)) {
        return v.round();
      }

      return fyo.pesa(0).round();
    },
    parse(value: unknown): Money {
      return safeParsePesa(value, this.fyo);
    },
    onBlur(e: FocusEvent) {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      this.showInput = false;
      this.triggerChange(target.value);
    },
    activateInput() {
      if (this.isReadOnly) {
        return;
      }

      this.showInput = true;
      nextTick(() => {
        this.focus();
      });
    },
  },
});
</script>
