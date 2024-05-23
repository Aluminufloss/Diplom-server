const GroupService = require("../service/group-service");
const GroupModel = require("../models/Group");
const UserModel = require("../models/User");
const ListModel = require("../models/List");
const ApiError = require("../exceptions/api-error");
const GroupDto = require("../dtos/group-dto");

jest.mock("../models/Group");
jest.mock("../models/User");
jest.mock("../models/List");
jest.mock("../dtos/group-dto");

describe("GroupService", () => {
  let groupService;

  beforeEach(() => {
    groupService = GroupService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createGroup", () => {
    it("should create a group and return GroupDto", async () => {
      const mockUser = { _id: "userId" };
      const mockGroup = { _id: "groupId", name: "groupName", lists: [] };
      UserModel.findOne.mockResolvedValue(mockUser);
      GroupModel.create.mockResolvedValue(mockGroup);

      const result = await groupService.createGroup("groupName", "userId");

      expect(UserModel.findOne).toHaveBeenCalledWith({ _id: "userId" });
      expect(GroupModel.create).toHaveBeenCalledWith({
        name: "groupName",
        userId: "userId",
      });
      expect(result).toBeInstanceOf(GroupDto);
    });

    it("should throw an error if user not found", async () => {
      UserModel.findOne.mockResolvedValue(null);

      await expect(
        groupService.createGroup("groupName", "userId")
      ).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Пользователя по данному id не обнаружено",
        })
      );

      expect(UserModel.findOne).toHaveBeenCalledWith({ _id: "userId" });
    });
  });

  describe("deleteGroup", () => {
    it("should delete a group and its lists", async () => {
      const mockGroup = { _id: "groupId", lists: ["listId1", "listId2"] };
      GroupModel.findOne.mockResolvedValue(mockGroup);
      GroupModel.deleteOne.mockResolvedValue();
      ListModel.deleteMany.mockResolvedValue();

      await groupService.deleteGroup("groupId");

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
      expect(ListModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ["listId1", "listId2"] },
      });
      expect(GroupModel.deleteOne).toHaveBeenCalledWith({ _id: "groupId" });
    });

    it("should throw an error if group not found", async () => {
      GroupModel.findOne.mockResolvedValue(null);

      await expect(groupService.deleteGroup("groupId")).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Неккоректный id группы",
        })
      );

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
    });
  });

  describe("updateGroupName", () => {
    it("should update the group name", async () => {
      const mockGroup = { _id: "groupId" };
      GroupModel.findOne.mockResolvedValue(mockGroup);
      GroupModel.updateOne.mockResolvedValue();

      await groupService.updateGroupName("groupId", "newGroupName");

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
      expect(GroupModel.updateOne).toHaveBeenCalledWith(
        { _id: "groupId" },
        { name: "newGroupName" }
      );
    });

    it("should throw an error if group not found", async () => {
      GroupModel.findOne.mockResolvedValue(null);

      await expect(
        groupService.updateGroupName("groupId", "newGroupName")
      ).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Неккоректный id группы",
        })
      );

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
    });
  });

  describe("addListToGroup", () => {
    it("should add a list to the group", async () => {
      const mockGroup = { _id: "groupId" };
      GroupModel.findOne.mockResolvedValue(mockGroup);
      GroupModel.updateOne.mockResolvedValue();

      await groupService.addListToGroup("groupId", "listId");

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
      expect(GroupModel.updateOne).toHaveBeenCalledWith(
        { _id: "groupId" },
        { $push: { lists: "listId" } }
      );
    });

    it("should throw an error if group not found", async () => {
      GroupModel.findOne.mockResolvedValue(null);

      await expect(
        groupService.addListToGroup("groupId", "listId")
      ).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Неккоректный id группы",
        })
      );

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
    });
  });

  describe("removeListFromGroup", () => {
    it("should remove a list from the group", async () => {
      const mockGroup = { _id: "groupId" };
      GroupModel.findOne.mockResolvedValue(mockGroup);
      GroupModel.updateOne.mockResolvedValue();

      await groupService.removeListFromGroup("groupId", "listId");

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
      expect(GroupModel.updateOne).toHaveBeenCalledWith(
        { _id: "groupId" },
        { $pull: { lists: "listId" } }
      );
    });

    it("should throw an error if group not found", async () => {
      GroupModel.findOne.mockResolvedValue(null);

      await expect(
        groupService.removeListFromGroup("groupId", "listId")
      ).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Неккоректный id группы",
        })
      );

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
    });
  });

  describe("getGroupsNames", () => {
    it("should return the names of the groups", async () => {
      const mockGroups = [{ name: "group1" }, { name: "group2" }];
      GroupModel.find.mockResolvedValue(mockGroups);

      const result = await groupService.getGroupsNames([
        "groupId1",
        "groupId2",
      ]);

      expect(GroupModel.find).toHaveBeenCalledWith({
        _id: { $in: ["groupId1", "groupId2"] },
      });
      expect(result).toEqual(["group1", "group2"]);
    });

    it("should throw an error if no groups found", async () => {
      GroupModel.find.mockResolvedValue(null);

      await expect(
        groupService.getGroupsNames(["groupId1", "groupId2"])
      ).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Неккоректный id группы",
        })
      );

      expect(GroupModel.find).toHaveBeenCalledWith({
        _id: { $in: ["groupId1", "groupId2"] },
      });
    });
  });

  describe("getGroupName", () => {
    it("should return the name of the group", async () => {
      const mockGroup = { name: "groupName" };
      GroupModel.findOne.mockResolvedValue(mockGroup);

      const result = await groupService.getGroupName("groupId");

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
      expect(result).toBe("groupName");
    });

    it("should throw an error if group not found", async () => {
      GroupModel.findOne.mockResolvedValue(null);

      await expect(groupService.getGroupName("groupId")).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Неккоректный id группы",
        })
      );

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
    });
  });

  describe("getGroup", () => {
    it("should return the group", async () => {
      const mockGroup = { _id: "groupId", name: "groupName" };
      GroupModel.findOne.mockResolvedValue(mockGroup);

      const result = await groupService.getGroup("groupId");

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
      expect(result).toEqual(mockGroup);
    });

    it("should return null if group not found", async () => {
      GroupModel.findOne.mockResolvedValue(null);

      const result = await groupService.getGroup("groupId");

      expect(GroupModel.findOne).toHaveBeenCalledWith({ _id: "groupId" });
      expect(result).toBeNull();
    });
  });

  describe("getGroups", () => {
    it("should return groups for the given userId", async () => {
      const mockGroups = [
        { _id: "groupId1", name: "groupName1", userId: "userId" },
        { _id: "groupId2", name: "groupName2", userId: "userId" },
      ];
      GroupModel.find.mockResolvedValue(mockGroups);

      const result = await groupService.getGroups("userId");

      expect(GroupModel.find).toHaveBeenCalledWith({ userId: "userId" });
      expect(result).toEqual(mockGroups.map((group) => new GroupDto(group)));
    });
  });
});
