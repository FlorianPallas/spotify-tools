<template>
  <button v-if="href === undefined" class="button" :class="{ secondary }">
    <slot />
  </button>
  <a
    v-else-if="outbound === true"
    :href="href"
    class="button"
    :class="{ secondary }"
  >
    <slot />
  </a>
  <nuxt-link
    v-else
    :to="href"
    tag="button"
    class="button"
    :class="{ secondary }"
  >
    <slot />
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';

export default Vue.extend({
  props: {
    href: {
      type: String,
      default: undefined,
      required: false,
    } as PropOptions<string | undefined>,
    outbound: { type: Boolean, default: false },
    secondary: { type: Boolean, default: false },
  },
});
</script>

<style lang="scss" scoped>
.button {
  background: $primary;
  color: $primary-color;
  border: none;
  padding: 1rem 4rem;
  border-radius: 3rem;
  font-size: 1.2rem;
  line-height: 100%;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  transition: background-color 0.3s, color 0.3s;
  cursor: pointer;

  // Anchor Variant
  display: inline-block;
  text-decoration: none;

  &:hover {
    background: lighten($color: $primary, $amount: 7.5);
    color: #fff;
  }
}

.button.secondary {
  background: transparent;
  box-shadow: 0 0 0 0.2rem #fff inset;

  &:hover {
    background: #fff;
    color: $background;
  }
}
</style>
