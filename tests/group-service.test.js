const GroupModel = require('../models/Group');
const UserModel = require('../models/User');
const ListModel = require('../models/List');

const GroupService = require('../service/group-service');

const ApiError = require('../exceptions/api-error');

const GroupDto = require('../dtos/group-dto');

jest.mock('../models/Group');
jest.mock('../models/User');
jest.mock('../models/List');

describe('GroupService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a group', async () => {
      const name = 'Test Group';
      const userId = 'userId';
      const mockUser = { _id: userId };

      UserModel.findOne.mockResolvedValue(mockUser);

      const mockGroup = { _id: 'group_id', name, userId };
      
      GroupModel.create.mockResolvedValue(mockGroup);

      const result = await GroupService.createGroup(name, userId);

      expect(result).toBeInstanceOf(GroupDto);
      expect(result.id).toEqual(mockGroup._id);
      expect(result.name).toEqual(mockGroup.name);
    });

    it('should throw an error if the user is not found', async () => {
      // Test setup
      const name = 'Test Group';
      const userId = 'userId';
      UserModel.findOne.mockResolvedValue(null);

      await expect(GroupService.createGroup(name, userId)).rejects.toThrow(ApiError.BadRequest);
    });
  });

  // Similarly, write tests for other methods like deleteGroup, updateGroupName, addListToGroup, removeListFromGroup, getGroupsNames, getGroupName, getGroup, and getGroups.
});
