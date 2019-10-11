Vue.component('item-row', {
  props: ['item'],
  template: ''
});
// localStorage persistence
const ITEM_STORAGE_KEY = 'anschreiben - items';
const LIGHT_THEME_STORAGE_KEY = 'anschreiben - lighttheme';

const itemStorage = {
  fetch: () => {
    const items = JSON.parse(localStorage.getItem(ITEM_STORAGE_KEY) || '[]');
    items.forEach((item, index) => item.id = index);
    itemStorage.uid = items.length;
    return items
  },

  save: (items) =>  localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items))
};

const themeStorage = {
  saveTheme: (isLight) => localStorage.setItem(LIGHT_THEME_STORAGE_KEY, JSON.stringify(isLight)),
  fetchTheme: () => JSON.parse(localStorage.getItem(LIGHT_THEME_STORAGE_KEY) || 'false')
};

const app = new Vue({
  el: '#app',

  data: {
    newItem: {},
    items: itemStorage.fetch(),
    selectedTip: 0,
    currentAction: '',
    lightTheme: themeStorage.fetchTheme(),
    deferredInstallPrompt: null
  },

  created() {
    this.registerServiceWorker();
    window.addEventListener('beforeinstallprompt', (e) => this.handleBeforeInstallPrompt(e))
  },

  watch: {
    items: {
      handler: (items) => itemStorage.save(items),
      deep: true
    },

    lightTheme: {
      handler: (isLight) => themeStorage.saveTheme(isLight)
    }
  },

  computed: {
    totalItemCount(){
      return this.items.map(i => i.amount).reduce((a, b) => a + b)
    },

    totalPrice() {
      return this.items.map(i => i.amount * i.price).reduce((a, b) => a + b)
    },

    priceWithTip(){
      return Math.round(this.totalPrice * this.selectedTip)
    },

    actualTip(){
      return (((this.priceWithTip / this.totalPrice) - 1) * 100.00).toFixed(2)
    }
  },

  filters: {
    currency: (value, digits) => {
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
    addItem() {
      this.newItem.amount = 1;
      this.newItem.completed = false;
      this.items.push(this.newItem);
      this.newItem = {};
      this.hideActions();
    },

    removeItem(item) {
      this.items.splice(this.items.indexOf(item), 1)
    },

    increaseItemAmount(item) {
      const indexOfItem = this.items.indexOf(item);
      item.amount++;
      Vue.set(app.items, indexOfItem, item);
    },

    decreaseItemAmount(item) {
      const indexOfItem = this.items.indexOf(item);
      if (item.amount > 0) {
        item.amount--;
      }
      Vue.set(app.items, indexOfItem, item);
    },

    toggleCompletionStatusOfItem(item) {
      const indexOfItem = this.items.indexOf(item);
      item.completed = !item.completed;
      Vue.set(app.items, indexOfItem, item);
    },

    setSelectedTip(selectedTip) {
      this.selectedTip = selectedTip;
    },

    showInstallPrompt() {
      if (!this.deferredInstallPrompt) {
        return;
      }
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt = null
      this.hideActions();
    },

    handleBeforeInstallPrompt(e) {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.showInstallAction();
    },

    removeAllItems() {
      this.confirmClearOrders = false;
      this.items = [];
      this.hideActions();
    },

    hideActions() {
     this.currentAction = ''
    },

    showAddAction() {
     this.toggleAction('add')
    },

    showClearAction() {
      this.toggleAction('clear')
    },

    showTipAction() {
      this.toggleAction('tip')
    },

    showInstallAction() {
      this.toggleAction('install')
    },

    toggleAction(action) {
     this.currentAction = this.currentAction !== action ? action : ''
    },

    toggleTheme() {
      this.lightTheme = !this.lightTheme
    },

    registerServiceWorker() {
       ('serviceWorker' in navigator) && navigator.serviceWorker.register('service-worker.js');
    }

  }
});
