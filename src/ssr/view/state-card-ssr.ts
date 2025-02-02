import "@material/mwc-list/mwc-list-item";
import type { CSSResultGroup, TemplateResult, PropertyValues } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators";
import { stopPropagation } from "../../common/dom/stop_propagation";
import { computeStateName } from "../../common/entity/compute_state_name";
import "../../components/entity/state-badge";
import { UNAVAILABLE } from "../../data/entity";
import type { SSRSelectEntity } from "../data/ssr_select";
import { setSSRSelectOption } from "../data/ssr_select";
import type { HomeAssistant } from "../../types";
import type { HaSelect } from "../../components/ha-select";

@customElement("state-card-ssr")
class StateCardInputSelect extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: SSRSelectEntity;

  @query("ha-select", true) private _haSelect!: HaSelect;

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has("stateObj")) {
      this._haSelect.select(0);
      this._haSelect.layoutOptions();
    }
  }

  protected render(): TemplateResult {
    return html`
      <state-badge .hass=${this.hass} .stateObj=${this.stateObj}></state-badge>
      <ha-select
          .label=${computeStateName(this.stateObj)}
          .value=${this.stateObj.state}
          .disabled=${
            this.stateObj.state === UNAVAILABLE /* UNKNOWN state is allowed */
          }
          naturalMenuWidth
          @selected=${this._selectedOptionChanged}
          @closed=${stopPropagation}
        >
          ${this.stateObj.attributes.option_prob
            ? Object.entries(this.stateObj.attributes.option_prob)
                .sort((a, b) => b[1] - a[1])
                .map(
                  ([option, prob]) =>
                    html`<mwc-list-item .value=${option}
                      >${option}: ${prob}</mwc-list-item
                    >`
                )
            : ""}
      </ha-select>
    `;
  }

  private async _selectedOptionChanged(ev) {
    const option = ev.target.value;
    if (option === this.stateObj.state) {
      return;
    }
    await setSSRSelectOption(this.hass, this.stateObj.entity_id, option);
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: flex;
      }

      state-badge {
        float: left;
        margin-top: 10px;
      }

      ha-select {
        width: 100%;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-ssr": StateCardInputSelect;
  }
}
