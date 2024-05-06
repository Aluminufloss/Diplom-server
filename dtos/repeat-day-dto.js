module.exports = class RepeatDayDto {
  isSelected;
  day;

  constructor(model) {
    this.isSelected = model.isSelected;
    this.day = model.day;
  }
}