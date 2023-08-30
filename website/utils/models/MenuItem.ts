import { RouteLocationRaw } from ".nuxt/vue-router";

export interface MenuItem {
  id?: string;
  label?: string;
  to?: RouteLocationRaw;
}
