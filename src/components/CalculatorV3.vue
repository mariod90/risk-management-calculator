<template>

    <a-layout class="layout-calculator">
      <a-layout-content>
        <a-row>
          <a-col :xs="24" :lg="12" class="calculator"> <!-- Calculator -->

            <a-radio-group v-model:value="typeOperation" size="large" button-style="solid" class="radio-group-type-operation" @click="typeOperationSelected = true">
              <a-radio-button value="long" class="btn-long">LONG</a-radio-button>
              <a-radio-button value="short" class="btn-short">SHORT</a-radio-button>
            </a-radio-group>

            <a-input-number v-model:value="percentMovementCompensation" :disabled="!typeOperationSelected" size="large" class="input-number-calc" placeholder="Distancia de compensación" @change="validateInputs">
              <template #addonBefore>
                <a-popover title="Porcentaje de compensación" trigger="click">
                  <template #content>
                    <p>Porcentaje de distancia en el que se irá agregando cada orden.</p>
                  </template>
                  <a-button type="text" class="button-popover">
                    <PercentageOutlined />
                  </a-button>
                </a-popover>
              </template>
            </a-input-number>

            <a-input-number v-model:value="percentCoinsForCompensation" :disabled="!typeOperationSelected" size="large" class="input-number-calc" placeholder="Porcentaje de monedas en compensación" @change="validateInputs">
              <template #addonBefore>
                <a-popover title="Porcentaje de monedas en compensación" trigger="click">
                  <template #content>
                    <p>Porcentaje de monedas que se irán agregando con respecto a la cantidad de la orden anterior.</p>
                    <p><b>Ej:</b> Orden #1: 100 monedas, entonces en Orden #2: 140 monedas (si se coloca el valor de 40%)</p>
                  </template>
                  <a-button type="text" class="button-popover">
                    <PercentageOutlined />
                  </a-button>
                </a-popover>
              </template>
            </a-input-number>

            <a-input-number v-model:value="moneyStopLoss" :disabled="!typeOperationSelected" size="large" class="input-number-calc" placeholder="Cantidad de USDT a arriesgar" @change="validateInputs">
              <template #addonBefore>
                <a-popover title="Cantidad de USDT a arriesgar" trigger="click">
                  <template #content>
                    <p>Cantidad de USDT que se desea arriesgar en la operación.</p>
                    <p>Si se toca el SL, se perdería la cantidad indicada aquí.</p>
                  </template>
                  <a-button type="text" class="button-popover">
                    <DollarOutlined />
                  </a-button>
                </a-popover>
              </template>
            </a-input-number>

            <a-input-number v-model:value="entryPrice" :disabled="!typeOperationSelected" size="large" class="input-number-calc" placeholder="Precio de entrada" @change="validateInputs">
              <template #addonBefore>
                <a-popover title="Precio de entrada" trigger="click">
                  <template #content>
                    <p>Precio de la moneda en la orden de entrada.</p>
                  </template>
                  <a-button type="text" class="button-popover">
                    <DollarOutlined />
                  </a-button>
                </a-popover>
              </template>
            </a-input-number>

            <a-input-number v-model:value="quantityCoinsInEntryPrice" :disabled="!typeOperationSelected" size="large" class="input-number-calc" placeholder="Monedas en precio de entrada" @change="validateInputs">
              <template #addonBefore>
                <a-popover title="Cantidad de monedas iniciales" trigger="click">
                  <template #content>
                    <p>Cantidad de monedas de la operación en el precio de entrada.</p>
                  </template>
                  <a-button type="text" class="button-popover">
                    <NumberOutlined />
                  </a-button>
                </a-popover>
              </template>
            </a-input-number>

            <a-button type="primary" size="large" @click="calculate" class="button-calc" :disabled="!allInputsFilled">
              <template #icon><CalculatorOutlined /></template>
              CALCULAR
            </a-button>

          </a-col> <!-- END Calculator -->

          <a-col :sm="24" :md="24" :lg="12"> <!-- Table results -->

            <a-table :columns="columns" :data-source="output" :pagination="false" :scroll="{ x: 450 }" v-if="showTable">
              <template #bodyCell="{ column, text }">
                <template v-if="column.dataIndex === 'order'">
                  <span>{{ text }}</span>
                </template>
              </template>
            </a-table>

          </a-col> <!-- END Table results -->
        </a-row>
      </a-layout-content>
    </a-layout>

</template>

<script>
import { notification } from 'ant-design-vue';
import PercentageOutlined from "@ant-design/icons-vue/PercentageOutlined";
import DollarOutlined from "@ant-design/icons-vue/DollarOutlined";
import NumberOutlined from "@ant-design/icons-vue/NumberOutlined";
import CalculatorOutlined from "@ant-design/icons-vue/CalculatorOutlined";

const columns = [
  {
    title: '#',
    dataIndex: 'order',
  },
  {
    title: 'PRECIO',
    dataIndex: 'price',
  },
  {
    title: 'MONEDAS',
    dataIndex: 'coins',
  },
  {
    title: 'USDT',
    dataIndex: 'usdt',
  },
];

export default {
  name: "CalculatorV3",
  components: {
    PercentageOutlined,
    DollarOutlined,
    NumberOutlined,
    CalculatorOutlined
  },
  setup() {
    return {
      columns
    };
  },
  data() {
    return {
      input: "",
      result: "",
      typeOperation: "",
      percentMovementCompensation: null,
      percentCoinsForCompensation: null,
      moneyStopLoss: null,
      entryPrice: null,
      quantityCoinsInEntryPrice: null,
      showTable: false,
      btnCalcDisabled: true,
      typeOperationSelected: false,
      allInputsFilled: false,
      output: []
    };
  },
  methods: {
    validateInputs() {
      this.allInputsFilled = typeof this.percentMovementCompensation === "number" &&
        typeof this.percentCoinsForCompensation === "number" &&
        typeof this.moneyStopLoss === "number" &&
        typeof this.entryPrice === "number" &&
        typeof this.quantityCoinsInEntryPrice === "number";
    },
    clear() {
      this.output = [];
      this.showTable = false;
    },
    calculate() {
      this.clear();
      let hitSL = false;
      let decimals = 0;
      try{
        if(!Number.isInteger(this.entryPrice)){
          decimals = this.entryPrice.toString().split(".")[1].length;
        }
        decimals = decimals <= 1 ? decimals + 1 : decimals;
        let sumUSD = this.entryPrice * this.quantityCoinsInEntryPrice;
        let quantityCoins = this.quantityCoinsInEntryPrice;
        let priceToPercentDistance = this.entryPrice;
        let priceAveraged = this.entryPrice;
        let sumCoins = quantityCoins;
        let lastMoneyRisk = -1;
        let lastPriceToPercentDistance = priceToPercentDistance;
        while (!hitSL && this.output.length < 10) {
          let lastPriceAveraged = priceAveraged;
          if(this.typeOperation === "long") {
            priceToPercentDistance -= priceToPercentDistance * this.percentMovementCompensation / 100;
          } else {
            priceToPercentDistance += priceToPercentDistance * this.percentMovementCompensation / 100;
          }
          quantityCoins += quantityCoins * (this.percentCoinsForCompensation / 100);
          const quantityUSD = priceToPercentDistance * quantityCoins;
          sumUSD += quantityUSD;
          sumCoins += quantityCoins;
          priceAveraged = sumUSD / sumCoins;
          let moneyRisk = sumUSD * (((priceAveraged - priceToPercentDistance) * 100) / priceAveraged) / 100;
          if(this.typeOperation === "short") {
            moneyRisk *= -1;
          }
          if (moneyRisk >= this.moneyStopLoss) {
            hitSL = true;
            const distanceToMoneyRiskPriceExceeded = (Math.abs(lastPriceAveraged - lastPriceToPercentDistance) * this.moneyStopLoss) / lastMoneyRisk;
            let priceSL = 0;
            if(this.typeOperation === "long") {
              priceSL = lastPriceAveraged - distanceToMoneyRiskPriceExceeded;
            } else {
              priceSL = lastPriceAveraged + distanceToMoneyRiskPriceExceeded;
            }
            let percentToSL = (Math.abs(priceSL - this.entryPrice) * 100) / this.entryPrice;

            this.output.push({
              key: this.output.length + 1,
              order: `SL(${this.typeOperation === 'long' ? '-' : ''}${percentToSL.toFixed(2)}%)`,
              price: `$${priceSL.toFixed(decimals)}`,
              coins: `$${(sumCoins - quantityCoins).toFixed(3)}`,
              usdt: `$${(sumUSD - quantityUSD).toFixed(2)}`
            });
          }else{
            lastMoneyRisk = moneyRisk;
            lastPriceToPercentDistance = priceToPercentDistance;
            this.output.push({
              key: this.output.length + 1,
              order: this.output.length + 1,
              price: `$${priceToPercentDistance.toFixed(decimals)}`,
              coins: quantityCoins.toFixed(3),
              usdt: `$${quantityUSD.toFixed(2)}`
            });
          }
        }
        if(this.output.length > 0){
          this.showTable = true;
          notification['success']({
            message: 'Exito!',
            description: 'Se han obtenido los puntos de órdenes exitosamente.'
          });
        } else {
          notification['warning']({
            message: 'Revisa tus variables de entrada',
            description: 'No se han obtenido los puntos de órdenes.'
          });
        }
      }catch (err) {
        const error = err.message ?? err;
        notification['error']({
          message: 'Ups! Ha ocurrido un error',
          description: error
        });
      }
    },
  },
}
</script>

<style scoped>

.layout-calculator {
  background: transparent;
}

.radio-group-type-operation, .button-calc {
  width: 100%;
}
.button-calc, .button-calc:active, .button-calc:focus, .button-calc:hover {
  background: rgb(252, 213, 53);
  color: rgb(24, 26, 32);
  border-color: rgb(252, 213, 53);
}

.button-calc:hover {
  opacity: 0.8;
}

.radio-group-type-operation > label {
  width: 50%;
  text-align: center;
}

.input-number-calc {
  width: 100%;
}

.button-popover {
  padding: 0;
  height: auto;
}

.calculator {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1rem;
}

@media (min-width: 992px) {
  .calculator {
    padding: 0 1.5rem;
  }
}

.btn-long.ant-radio-button-wrapper-checked {
  background: rgb(14, 203, 129) !important;
  border-color: rgb(14, 203, 129) !important;
  font-weight: bold !important;
}

.btn-long.ant-radio-button-wrapper-checked:hover {
  color: #fff !important;
}

.btn-long:hover {
  color: rgb(14, 203, 129) !important;
  border-color: rgb(14, 203, 129) !important;
}

.btn-long:hover + .btn-short::before {
  background: none !important;
}

.btn-short.ant-radio-button-wrapper-checked {
  background: rgb(246, 70, 93) !important;
  border-color: rgb(246, 70, 93) !important;
  font-weight: bold !important;
}

.btn-short.ant-radio-button-wrapper-checked:hover {
  color: #fff !important;
}

.btn-short:hover {
  color: rgb(246, 70, 93) !important;
  border-color: rgb(246, 70, 93) !important;
}

.btn-short.ant-radio-button-wrapper-checked::before {
  background: rgb(246, 70, 93) !important;
}

.btn-short:hover::before, .btn-short:active::before, .btn-short:focus::before, .btn-short:visited::before, .btn-short:focus-visible::before, .btn-short:focus-within::before {
  background: rgb(246, 70, 93) !important;
}

</style>
