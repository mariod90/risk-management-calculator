<template>

    <a-layout class="layout-calculator">
      <a-layout-content>
        <a-row>
          <a-col :xs="24" :lg="12"> <!-- Calculator -->

            <a-radio-group v-model:value="typeOperation" size="large" button-style="solid" class="radio-group-type-operation">
              <a-radio-button value="long">LONG</a-radio-button>
              <a-radio-button value="short">SHORT</a-radio-button>
            </a-radio-group>

            <a-input-number v-model:value="percentMovementCompensation" size="large" class="input-number-calc">
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

            <a-input-number v-model:value="percentCoinsForCompensation" size="large" class="input-number-calc">
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

            <a-input-number v-model:value="moneyStopLoss" size="large" class="input-number-calc">
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

            <a-input-number v-model:value="entryPrice" size="large" class="input-number-calc">
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

            <a-input-number v-model:value="quantityCoinsInEntryPrice" size="large" class="input-number-calc">
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

            <a-button type="primary" size="large" @click="calculate">
              <template #icon><CalculatorOutlined /></template>
              Calcular
            </a-button>


<!--            <a-row>
              <a-col :xs="12" :lg="12">
                <a-button>LONG</a-button>
              </a-col>
              <a-col :xs="12" :lg="12">
                <a-button>SHORT</a-button>
              </a-col>
            </a-row>-->

          </a-col> <!-- END Calculator -->

          <a-col :sm="24" :md="24" :lg="12"> <!-- Table results -->

            <table class="" v-if="showTable">
              <thead>
              <tr>
                <th>#</th>
                <th>PRECIO</th>
                <th>MONEDAS</th>
                <th>USDT</th>
              </tr>
              </thead>
              <tbody id="salida">
              <tr v-for="(item, index) in output" :key="index">
                <td>{{ item.index }}</td>
                <td>{{ item.price }}</td>
                <td>{{ item.coins }}</td>
                <td>{{ item.usdt }}</td>
              </tr>
              </tbody>
            </table>

          </a-col> <!-- END Table results -->
        </a-row>
      </a-layout-content>
    </a-layout>


  <div class="calculator">



<!--    <div class="item">
      <span>Type operation</span>
      <select v-model="typeOperation">
        <option value="long">LONG</option>
        <option value="short">SHORT</option>
      </select>
    </div>-->

<!--    <div class="item">
      <span>% Movement compensacion</span>
      <input type="number" v-model="percentMovementCompensation"  />
    </div>-->

<!--    <div class="item">
      <span>% Coins for compensation</span>
      <input type="number" v-model="percentCoinsForCompensation"  />
    </div>-->

<!--    <div class="item">
      <span>USD Stop Loss</span>
      <input type="number" v-model="moneyStopLoss" placeholder="$" />
    </div>-->

<!--    <div class="item">
      <span>Entry price</span>
      <input type="number" v-model="entryPrice"  />
    </div>-->

<!--    <div class="item">
      <span>Quantity coin in entry price</span>
      <input type="number" v-model="quantityCoinsInEntryPrice" />
    </div>-->

<!--    <button @click="calculate">Calculate</button>-->
  </div>


</template>

<script>
import PercentageOutlined from "@ant-design/icons-vue/PercentageOutlined";
import DollarOutlined from "@ant-design/icons-vue/DollarOutlined";
import NumberOutlined from "@ant-design/icons-vue/NumberOutlined";
import CalculatorOutlined from "@ant-design/icons-vue/CalculatorOutlined";

export default {
  name: "CalculatorV3",
  components: {
    PercentageOutlined,
    DollarOutlined,
    NumberOutlined,
    CalculatorOutlined
  },
  data() {
    return {
      input: "",
      result: "",
      typeOperation: "",
      percentMovementCompensation: 3,
      percentCoinsForCompensation: 40,
      moneyStopLoss: 4,
      entryPrice: 15.5,
      quantityCoinsInEntryPrice: 0.7,
      showTable: false,
      output: []
    };
  },
  methods: {
    clear() {
      this.output = [];
    },
    calculate() {
      this.clear();
      let hitSL = false;
      let decimals = this.entryPrice.toString().split(".")[1].length;
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
          // calculate price averaged
          const diffPrices = this.entryPrice - priceToPercentDistance;
          const valueToAdd = diffPrices * (this.percentCoinsForCompensation / 100);
          priceAveraged = priceToPercentDistance + valueToAdd;
        } else {
          priceToPercentDistance += priceToPercentDistance * this.percentMovementCompensation / 100;
          // calculate price averaged
          const diffPrices = priceToPercentDistance - this.entryPrice;
          const valueToSub = diffPrices * (this.percentCoinsForCompensation / 100);
          priceAveraged = priceToPercentDistance - valueToSub;
        }
        quantityCoins += quantityCoins * (this.percentCoinsForCompensation / 100);
        const quantityUSD = priceToPercentDistance * quantityCoins;
        sumUSD += quantityUSD;

        let moneyRisk = sumUSD * (((priceAveraged - priceToPercentDistance) * 100) / priceAveraged) / 100;
        if(this.typeOperation === "short") {
          moneyRisk *= -1;
        }

        if (moneyRisk >= this.moneyStopLoss) {
          hitSL = true;
          const distanceToMoneyRiskPriceExceeded = (Math.abs(lastPriceAveraged - lastPriceToPercentDistance) * this.moneyStopLoss) / lastMoneyRisk; // 0.806
          let priceSL = 0;
          if(this.typeOperation === "long") {
            priceSL = lastPriceAveraged - distanceToMoneyRiskPriceExceeded;
          } else {
            priceSL = lastPriceAveraged + distanceToMoneyRiskPriceExceeded;
          }
          let percentToSL = (Math.abs(priceSL - this.entryPrice) * 100) / this.entryPrice;

          this.output.push({
            index: `SL(${this.typeOperation === 'long' ? '-' : ''}${percentToSL.toFixed(2)}%)`,
            price: `$${priceSL.toFixed(decimals)}`,
            coins: sumCoins.toFixed(3), // ***** OK ***** //
            usdt: `$${(sumUSD - quantityUSD).toFixed(2)}` // ***** OK ***** //
          });
        }else{
          lastMoneyRisk = moneyRisk;
          sumCoins += quantityCoins;
          lastPriceToPercentDistance = priceToPercentDistance;

          this.output.push({
            index: this.output.length + 1,
            price:  `$${priceToPercentDistance.toFixed(decimals)}`,
            coins: quantityCoins.toFixed(3),
            usdt: `$${quantityUSD.toFixed(2)}`
          });
        }
      }
      this.showTable = this.output.length > 0;
    },
  },
}
</script>

<style scoped>

.layout-calculator {
  background: transparent;
}

.radio-group-type-operation {
  width: 100%;
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
  align-items: center;
  justify-content: center;
}
.calculator .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px;
}
</style>
