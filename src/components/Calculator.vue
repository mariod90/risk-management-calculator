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
      <span>Entry price</span>
      <input type="number" v-model="entryPrice"  />
    </div>

    <div class="item">
      <span>Quantity coin in entry price</span>
      <input type="number" v-model="quantityCoinsInEntryPrice" />
    </div>

    <button @click="calculate">Calculate</button>
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
  name: "Calculator",
  data() {
    return {
      input: "",
      result: "",
      typeOperation: "",
      percentMovementCompensation: 3.17,
      percentCoinsForCompensation: 40,
      moneyStopLoss: 5,
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
      let priceCalculate = this.entryPrice;
      let totalUSDT = this.entryPrice * this.quantityCoinsInEntryPrice;
      let coinsToAdd = this.quantityCoinsInEntryPrice;
      let sumCoinsToAdd = this.quantityCoinsInEntryPrice;
      const entryPriceString = this.entryPrice.toString();
      const decimals = entryPriceString.split(".")[1].length;
      let sumPercentMovementCompensation = this.percentMovementCompensation;
      let counterCompensations = 0;
      while (!hitSL && this.output.length < 30) {
        const moneyRisk = totalUSDT * (sumPercentMovementCompensation / 100);
        if(moneyRisk < this.moneyStopLoss) {
          sumPercentMovementCompensation += this.percentMovementCompensation;
          const percentToAddOrSubs = priceCalculate * (this.percentMovementCompensation / 100);
          if(this.typeOperation === 'long') {
            priceCalculate -= percentToAddOrSubs;
          } else {
            priceCalculate += percentToAddOrSubs;
          }
          coinsToAdd *= 1 + (this.percentCoinsForCompensation / 100);
          sumCoinsToAdd += coinsToAdd;
          totalUSDT += priceCalculate * coinsToAdd;
          this.output.push({
            index: ++counterCompensations,
            price: priceCalculate.toFixed(decimals),
            coins: coinsToAdd.toFixed(3),
            usdt: (priceCalculate * coinsToAdd).toFixed(2)
          });
        } else {
          hitSL = true;
          const percentStopLoss = (sumPercentMovementCompensation * this.moneyStopLoss) / moneyRisk;
          console.log('percentStopLoss', percentStopLoss);
          const percentSLToAddOrSubs = this.entryPrice * (percentStopLoss/100);
          console.log('percentSLToAddOrSubs', percentSLToAddOrSubs);
          let priceStopLoss = priceCalculate;
          console.log('priceStopLoss', priceStopLoss);
          if(this.typeOperation === 'long') {
            priceStopLoss -= percentSLToAddOrSubs;
          } else {
            priceStopLoss += percentSLToAddOrSubs;
          }
          console.log('priceStopLoss', priceCalculate);
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
}
.calculator .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px;
}
</style>
