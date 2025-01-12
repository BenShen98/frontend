import type {
  HassEntityAttributeBase,
  HassEntityBase,
} from "home-assistant-js-websocket";
import type { HomeAssistant } from "../../types";

interface SSRSelectEntityAttributes extends HassEntityAttributeBase {
  options: string[];
  option_prob: { [key: string]: number };
}

export interface SSRSelectEntity extends HassEntityBase {
  attributes: SSRSelectEntityAttributes;
}

export interface SSRSelect {
  id: string;
  name: string;
  options: string[];
  icon?: string;
  initial?: string;
}

export interface SSRSelectMutableParams {
  name: string;
  icon: string;
  initial: string;
  options: string[];
}

export const setSSRSelectOption = (
  hass: HomeAssistant,
  entity: string,
  option: string,
  callback?: (result: any) => void
) =>
  hass
    .callService("ssr", "select_option", {
      option,
      entity_id: entity,
    })
    .then((result) => {
      if (callback) callback(result);
      return result;
    });

export const fetchSSRSelect = (hass: HomeAssistant) =>
  hass.callWS<SSRSelect[]>({ type: "ssr_select/list" });

export const createSSRSelect = (
  hass: HomeAssistant,
  values: SSRSelectMutableParams
) =>
  hass.callWS<SSRSelect>({
    type: "ssr_select/create",
    ...values,
  });

export const updateSSRSelect = (
  hass: HomeAssistant,
  id: string,
  updates: Partial<SSRSelectMutableParams>
) =>
  hass.callWS<SSRSelect>({
    type: "ssr_select/update",
    ssr_select_id: id,
    ...updates,
  });

export const deleteSSRSelect = (hass: HomeAssistant, id: string) =>
  hass.callWS({
    type: "ssr_select/delete",
    ssr_select_id: id,
  });
