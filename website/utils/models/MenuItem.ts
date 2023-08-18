import { RouteLocationRaw } from ".nuxt/vue-router";

export interface MenuItem {
  label?: string;
  to?: RouteLocationRaw;
}
