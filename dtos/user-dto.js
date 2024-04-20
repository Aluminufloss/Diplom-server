module.exports = class UserDto {
    email;
    id;
    username;
  
    constructor(model) {
      this.id = model.id;
      this.email = model.email;
      this.username = model.username;
    }
  }