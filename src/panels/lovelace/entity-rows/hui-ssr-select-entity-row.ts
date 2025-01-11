import "@material/mwc-list/mwc-list-item";
import type { PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { stopPropagation } from "../../../common/dom/stop_propagation";
import { computeStateName } from "../../../common/entity/compute_state_name";
import "../../../components/ha-select";
import type { HaSelect } from "../../../components/ha-select";
import { UNAVAILABLE } from "../../../data/entity";
import { forwardHaptic } from "../../../data/haptics";
import type { SSRSelectEntity } from "../../../data/ssr_select";
import { setSSRSelectOption } from "../../../data/ssr_select";
import type { HomeAssistant } from "../../../types";
import type { EntitiesCardEntityConfig } from "../cards/types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { LovelaceRow } from "./types";

@customElement("hui-ssr-select-entity-row")
class HuiSSRSelectEntityRow extends LitElement implements LovelaceRow {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntitiesCardEntityConfig;

  @query("ha-select") private _haSelect!: HaSelect;

  public setConfig(config: EntitiesCardEntityConfig): void {
    if (!config || !config.entity) {
      throw new Error("Entity must be specified");
    }

    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (!this._config) {
      return;
    }
    if (changedProps.has("hass")) {
      const oldHass = changedProps.get("hass");
      const stateObj = this.hass?.states[this._config.entity] as
        | SSRSelectEntity
        | undefined;
      const oldStateObj = oldHass?.states[this._config.entity] as
        | SSRSelectEntity
        | undefined;
      if (
        stateObj &&
        stateObj.attributes.options !== oldStateObj?.attributes.options
      ) {
        this._haSelect.layoutOptions();
      }
    }
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const stateObj = this.hass.states[this._config.entity] as
      | SSRSelectEntity
      | undefined;

    if (!stateObj) {
      return html`
        <hui-warning>
          ${createEntityNotFoundWarning(this.hass, this._config.entity)}
        </hui-warning>
      `;
    }
    return html`
      <hui-generic-entity-row
        .hass=${this.hass}
        .config=${this._config}
        hide-name
      >
        <ha-select
          .label=${this._config.name || computeStateName(stateObj)}
          .value=${stateObj.state}
          .disabled=${
            stateObj.state === UNAVAILABLE /* UNKNOWN state is allowed */
          }
          naturalMenuWidth
          @selected=${this._selectedChanged}
          @click=${stopPropagation}
          @closed=${stopPropagation}
        >
          ${stateObj.attributes.option_prob
            ? Object.entries(stateObj.attributes.option_prob)
                .sort((a, b) => b[1] - a[1])
                .map(
                  ([option, prob]) =>
                    html`<mwc-list-item .value=${option}
                      >${option}: ${prob}</mwc-list-item
                    >`
                )
            : ""}
        </ha-select>
      </hui-generic-entity-row>
    `;
  }

  static styles = css`
    hui-generic-entity-row {
      display: flex;
      align-items: center;
    }
    ha-select {
      width: 100%;
    }
  `;

  private _selectedChanged(ev): void {
    const stateObj = this.hass!.states[this._config!.entity] as SSRSelectEntity;
    const option = ev.target.value;
    if (
      option === stateObj.state ||
      !stateObj.attributes.options.includes(option)
    ) {
      return;
    }

    forwardHaptic("light");

    setSSRSelectOption(this.hass!, stateObj.entity_id, option);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-ssr-select-entity-row": HuiSSRSelectEntityRow;
  }
}
