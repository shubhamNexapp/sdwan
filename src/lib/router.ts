//  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.


import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'
import { isStandaloneMode } from './config'

/**
 * Used in <router-link> elements of standalone UI to build the full path of destination page. 'route' input param is sometimes needed (e.g. from goTo() function in StandaloneDashboardView.vue)
 *
 */
export const getStandaloneRoutePrefix = (route?: RouteLocationNormalizedLoaded) => {
  if (!route) {
    route = useRoute()
  }

  if (isStandaloneMode()) {
    // standalone
    return `/standalone`
  } else {
    // a controller is managing this unit
    return `/controller/manage/${route.params.unitId}`
  }
}

/**
 * Used in <router-link> elements of controller UI to build the full path of destination page
 *
 */
export const getControllerRoutePrefix = () => {
  // call this function in controller menu items
  return `/controller`
}
