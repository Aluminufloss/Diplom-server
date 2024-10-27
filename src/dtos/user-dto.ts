import { IUserDto } from "@/types/IUser";

class UserDto implements IUserDto {
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
