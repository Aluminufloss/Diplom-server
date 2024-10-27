interface UserDto {
  email: string;
  id: string;
  username?: string;
}

class UserDto implements UserDto {
  email: string;
  id: string;
  username?: string;

  constructor(model: UserDto) {
    this.id = model.id;
    this.email = model.email;
    this.username = model.username;
  }
}

export default UserDto;