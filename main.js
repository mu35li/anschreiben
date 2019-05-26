Vue.component('item-row', {
  props: ['item'],
  template: ''
});
// localStorage persistence
const ITEM_STORAGE_KEY = 'anschreiben - items';
const LIGHT_THEME_STORAGE_KEY = 'anschreiben - lighttheme';
var itemStorage = {
  fetch: function () {
    var items = JSON.parse(localStorage.getItem(ITEM_STORAGE_KEY) || '[]');
    items.forEach(function (item, index) {
      item.id = index
    });
    itemStorage.uid = items.length;
    return items
  },
  save: function (items) {
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
  },
};

var themeStorage = {
  saveTheme: function (isLight) {
    localStorage.setItem(LIGHT_THEME_STORAGE_KEY, JSON.stringify(isLight));
  },
  fetchTheme: function () {
    return JSON.parse(localStorage.getItem(LIGHT_THEME_STORAGE_KEY) || 'false');
  }
}

var app = new Vue({
  el: '#app',
  data: {
    newItem: {},
    items: itemStorage.fetch(),
    selectedTip: 0,
    currentAction: '',
    lightTheme: themeStorage.fetchTheme(),
  },

  watch: {
    items: {
      handler: function (items) {
        itemStorage.save(items)
      },
      deep: true
    },
    lightTheme: {
      handler: function (isLight) {
        themeStorage.saveTheme(isLight)
      }
    }
  },

  computed: {
    totalItemCount: function() {
      var totalItemCount = 0
      for (itemIndex in this.items) {
        var item = this.items[itemIndex];
        totalItemCount += item.amount;
      }
      return totalItemCount;
    },
    totalPrice: function() {
      var totalPrice = 0;
      for (itemIndex in this.items) {
        var item = this.items[itemIndex];
        totalPrice += item.price*item.amount;
      }
      return totalPrice;
    },
    priceWithTip: function() {
      return Math.round(this.totalPrice * this.selectedTip);
    },
    actualTip: function() {
      return (((this.priceWithTip/this.totalPrice)-1)*100.00).toFixed(2);
    }
  },

  filters: {
    currency: function(value, digits) {
      let number = parseFloat(value);
      let options = {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      };
      return number.toLocaleString('de-DE', options)
    }
  },
  methods: {
    addItem: function() {
      this.newItem.amount = 1;
      this.items.push(this.newItem);
      this.newItem = {};
      this.hideActions();
    },
    removeItem: function(item) {
      this.items.splice(this.items.indexOf(item), 1)
    },
    increaseItemAmount: function(item) {
      var indexOfItem = this.items.indexOf(item);
      item.amount++;
      Vue.set(app.items, indexOfItem, item);
    },
    decreaseItemAmount: function(item) {
      var indexOfItem = this.items.indexOf(item);
      if (item.amount > 0) {
        item.amount--;
      }
      Vue.set(app.items, indexOfItem, item);
    },
    setSelectedTip: function(selectedTip) {
      this.selectedTip = selectedTip;
    },
    removeAllItems: function() {
      this.confirmClearOrders = false
      this.items = []
      this.hideActions();
    },
    hideActions: function() {
      this.currentAction = ''
    },
    showAddAction: function() {
      this.toggleAction('add')
    },
    showClearAction: function() {
      this.toggleAction('clear')
    },
    showTipAction: function() {
      this.toggleAction('tip')
    },
    toggleAction: function(action) {
      if (this.currentAction == action) {
        this.currentAction = ''
      } else {
        this.currentAction = action
      }
    },
    toggleTheme: function() {
      this.lightTheme = !this.lightTheme
    }
  }
});
