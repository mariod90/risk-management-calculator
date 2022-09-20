<template>

  <div class="calculator">
    <div class="item">
      <span>Type operation</span>
      <select v-model="typeOperation">
        <option value="long">LONG</option>
        <option value="short">SHORT</option>
      </select>
    </div>

    <div class="item">
      <span>$Total capital (USD)</span>
      <input type="number" v-model="totalCapital"  />
    </div>

    <div class="item">
      <span>% Movement compensacion</span>
      <input type="number" v-model="percentMovementCompensation"  />
    </div>

    <div class="item">
      <span>% Coins for compensation</span>
      <input type="number" v-model="percentCoinsForCompensation"  />
    </div>

    <div class="item">
      <span>USD Stop Loss</span>
      <input type="number" v-model="moneyStopLoss" placeholder="$" />
    </div>

    <div class="item">
      <span>USD First Order</span>
      <input type="number" v-model="moneyFirstOrder" placeholder="$" />
    </div>

    <div class="item">
      <span>Entry price</span>
      <input type="number" v-model="entryPrice"  />
    </div>


    <button @click="calculate">Calculate</button>
  </div>

  <div v-if="showTable" class="total-cost-op">
    <span>
      Total cost operation:  {{ totalCostOperation.toFixed(2) }}
    </span>
  </div>

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
</template>

<script>
export default {
  name: "CalculatorV2",
  data() {
    return {
      totalCapital: 100,
      typeOperation: "",
      percentMovementCompensation: 3.17,
      percentCoinsForCompensation: 40,
      moneyStopLoss: 5,
      moneyFirstOrder: 2,
      entryPrice: 15.5,
      quantityCoinsInEntryPrice: 0,
      costUSDByOrder: 0,
      showTable: false,
      totalCostOperation: 0,
      quantityOrders: 0,
      output: []
    };
  },
  methods: {
    clear() {
      this.output = [];
      this.totalCostOperation = 0;
      this.quantityOrders = 0;
      this.quantityCoinsInEntryPrice = 0;
      this.costUSDByOrder = 0;
    },
    calculateFirstUSDValue() {
      const result = [];
      let lastValue = this.totalCostOperation;
      for (let i = 0; i < this.quantityOrders; i++) {
        const value = lastValue / (1 + this.percentCoinsForCompensation / 100);
        result.push(value);
        lastValue = value;
      }
      const sumValues = result.reduce((partialSum, a) => partialSum + a, 0);
      this.costUSDByOrder = (lastValue * this.totalCostOperation) / sumValues;
      this.quantityCoinsInEntryPrice = this.costUSDByOrder / this.entryPrice;
    },
    calculate() {
      this.clear();
      let hitSL = false;
      this.quantityOrders = Math.round(this.moneyStopLoss / this.moneyFirstOrder);
      const percentUserStopLoss = (this.moneyStopLoss / this.totalCapital) * 100;
      let totalUSDT = (this.totalCapital * percentUserStopLoss) / this.percentMovementCompensation;
      totalUSDT /= this.quantityOrders;
      this.totalCostOperation = totalUSDT;
      this.calculateFirstUSDValue();
      let priceCalculate = this.entryPrice;
      let coinsToAdd = this.quantityCoinsInEntryPrice;
      let sumCoinsToAdd = this.quantityCoinsInEntryPrice;
      const entryPriceString = this.entryPrice.toString();
      const decimals = entryPriceString.split(".")[1].length;
      let sumPercentMovementCompensation = this.percentMovementCompensation;
      let counterCompensations = 0;
      while (!hitSL && this.output.length <= (this.quantityOrders + 1)) {
        const moneyRisk = totalUSDT * (sumPercentMovementCompensation / 100);
        console.log('moneyRisk', moneyRisk);
        if(Math.round(moneyRisk) < this.moneyStopLoss) {
          if(counterCompensations === 0) {
            this.output.push({
              index: "PE",
              price: priceCalculate.toFixed(decimals),
              coins: coinsToAdd.toFixed(3),
              usdt: this.costUSDByOrder.toFixed(2)
            });
            counterCompensations++;
          }else{
            sumPercentMovementCompensation += this.percentMovementCompensation;
            const percentToAddOrSubs = priceCalculate * (this.percentMovementCompensation / 100);
            if(this.typeOperation === 'long') {
              priceCalculate -= percentToAddOrSubs;
            } else {
              priceCalculate += percentToAddOrSubs;
            }
            this.costUSDByOrder *= 1 + (this.percentCoinsForCompensation / 100);
            coinsToAdd = this.costUSDByOrder / priceCalculate;
            sumCoinsToAdd += coinsToAdd;
            this.output.push({
              index: ++counterCompensations,
              price: priceCalculate.toFixed(decimals),
              coins: coinsToAdd.toFixed(3),
              usdt: this.costUSDByOrder.toFixed(2)
            });
          }
        } else {
          hitSL = true;
          const percentStopLoss = (sumPercentMovementCompensation * this.moneyStopLoss) / moneyRisk;
          const percentSLToAddOrSubs = this.entryPrice * (percentStopLoss/100);
          let priceStopLoss = this.entryPrice;
          if(this.typeOperation === 'long') {
            priceStopLoss -= percentSLToAddOrSubs;
          } else {
            priceStopLoss += percentSLToAddOrSubs;
          }
          this.output.push({
            index: `SL(${this.typeOperation === 'long' ? '-' : ''}${percentStopLoss.toFixed(2)}%)`,
            price: priceStopLoss.toFixed(decimals),
            coins: sumCoinsToAdd.toFixed(3),
            usdt: totalUSDT.toFixed(2)
          });
        }
      }
      this.showTable = true;
    },
  },
}
</script>

<style scoped>
.calculator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}
.calculator .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px;
}
.total-cost-op {
  margin-bottom: 20px;
}
</style>
