class Rate {
  constructor(data) {
    if (data) {
      this.id = data.id
      this.date = data.date
      this.rate = data.rate
      this.ticker = data.ticker
    }
  }
}

module.exports = Rate
