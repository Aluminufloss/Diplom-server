const ListModel = require("../models/List");
const UserModel = require("../models/User");
const TaskModel = require("../models/Task");
const GroupModel = require("../models/Group");
const GeneralListsModel = require("../models/GeneralLists");

const makeGroupsFromLists = require("../utils/makeGroupsFromLists");
const { isFirstDateAfterSecond, isDatesEqual } = require("../utils/datesUtils");

const ListDto = require("../dtos/list-dto");
const TaskDto = require("../dtos/task-dto");

const ApiError = require("../exceptions/api-error");

const ListService = require("../service/list-service");

jest.mock("../models/List");
jest.mock("../models/User");
jest.mock("../models/Task");
jest.mock("../models/Group");
jest.mock("../models/GeneralLists");
jest.mock("../utils/makeGroupsFromLists");
jest.mock("../utils/datesUtils");

describe("ListService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createList", () => {
    it("should create a new list", async () => {
      const name = "Test List";
      const userId = "userId";
      const groupId = "groupId";
      const mockList = { _id: "listId", name, userId, groupId };
      const mockListDto = new ListDto(mockList);

      UserModel.findOne.mockResolvedValue({ _id: userId });
      ListModel.findOne.mockResolvedValue(null);
      ListModel.create.mockResolvedValue(mockList);

      const result = await ListService.createList(name, userId, groupId);

      expect(UserModel.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(ListModel.findOne).toHaveBeenCalledWith({ name, userId });
      expect(ListModel.create).toHaveBeenCalledWith({ name, userId, groupId });
      expect(result).toEqual(mockListDto);
    });

    it("should throw an error if user is not found", async () => {
      const name = "Test List";
      const userId = "userId";

      UserModel.findOne.mockResolvedValue(null);

      await expect(ListService.createList(name, userId)).rejects.toThrow(
        ApiError.BadRequest("Пользователя по данному id не обнаружено").message
      );
    });

    it("should throw an error if list with the same name exists", async () => {
      const name = "Test List";
      const userId = "userId";

      UserModel.findOne.mockResolvedValue({ _id: userId });
      ListModel.findOne.mockResolvedValue({});

      await expect(ListService.createList(name, userId)).rejects.toThrow(
        ApiError.BadRequest("Список с таким названием уже существует").message
      );
    });
  });

  describe("getTasksByListId", () => {
    it("should get tasks by list ID", async () => {
      const listId = "listId";
      const mockTask = {
        _id: "taskId",
        title: "Test Task",
        plannedDate: new Date(),
      };
      const mockTaskDto = new TaskDto(mockTask);
      const mockList = { _id: listId, tasks: [mockTask._id] };

      ListModel.findOne.mockResolvedValue(mockList);
      TaskModel.findOne.mockResolvedValue(mockTask);

      isFirstDateAfterSecond.mockReturnValue(true);
      isDatesEqual.mockReturnValue(true);

      const result = await ListService.getTasksByListId(listId);

      expect(ListModel.findOne).toHaveBeenCalledWith({ _id: listId });
      expect(TaskModel.findOne).toHaveBeenCalledWith({ _id: mockTask._id });
      expect(result).toEqual([mockTaskDto]);
      expect(mockTask.status).toBe("expired");
    });
  });

  describe("createGeneralLists", () => {
    it("should create general lists", async () => {
      const userId = "userId";
      const mockGeneralLists = { _id: "generalListsId", userId };
      const mockGeneralListsModel = new GeneralListsModel(mockGeneralLists);

      GeneralListsModel.create.mockResolvedValue(mockGeneralLists);

      const result = await ListService.createGeneralLists(userId);

      expect(GeneralListsModel.create).toHaveBeenCalledWith({
        userId,
        todayList: { tasks: [] },
        plannedList: { tasks: [] },
        allTasksList: { tasks: [] },
      });
      expect(result).toEqual(mockGeneralListsModel);
    });
  });

  describe("deleteList", () => {
    it("should delete a list", async () => {
      const listId = "listId";
      const userId = "userId";
      const mockList = { _id: listId, userId };

      ListModel.findOne.mockResolvedValue(mockList);

      await ListService.deleteList(listId, userId);

      expect(ListModel.findOne).toHaveBeenCalledWith({ _id: listId });
      expect(ListModel.deleteOne).toHaveBeenCalledWith({ _id: listId });
    });

    it("should throw an error if list id is incorrect", async () => {
      const listId = "listId";
      const userId = "userId";

      ListModel.findOne.mockResolvedValue(null);

      await expect(ListService.deleteList(listId, userId)).rejects.toThrow(
        ApiError.BadRequest("Неккоректный id списка").message
      );
    });

    it("should throw an error if user id is incorrect", async () => {
      const listId = "listId";
      const userId = "userId";
      const mockList = { _id: listId, userId: "wrongUserId" };

      ListModel.findOne.mockResolvedValue(mockList);

      await expect(ListService.deleteList(listId, userId)).rejects.toThrow(
        ApiError.BadRequest("Неккоректный id пользователя").message
      );
    });
  });

  describe("getList", () => {
    it("should get a list by ID", async () => {
      const listId = "listId";
      const mockList = { _id: listId };

      ListModel.findOne.mockResolvedValue(mockList);

      const result = await ListService.getList(listId);

      expect(ListModel.findOne).toHaveBeenCalledWith({ _id: listId });
      expect(result).toEqual(mockList);
    });
  });

  describe("getLists", () => {
    it("should get lists by user ID", async () => {
      const userId = "userId";
      const mockLists = [{ _id: "listId", name: "Test List" }];
      const mockGroups = [
        { _id: "groupId", name: "Test Group", lists: ["listId"] },
      ];
      const mockListsObject = { lists: mockLists, groups: mockGroups };

      ListModel.find.mockResolvedValue(mockLists);
      GroupModel.find.mockResolvedValue(mockGroups);
      makeGroupsFromLists.mockResolvedValue(mockListsObject);

      const result = await ListService.getLists(userId);

      expect(ListModel.find).toHaveBeenCalledWith({ userId });
      expect(GroupModel.find).toHaveBeenCalledWith({ userId });
      expect(makeGroupsFromLists).toHaveBeenCalledWith(mockLists, mockGroups);
      expect(result).toEqual(mockListsObject);
    });
  });

  describe("getListName", () => {
    it("should get the name of a list by ID", async () => {
      const listId = "listId";
      const mockList = { _id: listId, name: "Test List" };

      ListModel.findOne.mockResolvedValue(mockList);

      const result = await ListService.getListName(listId);

      expect(ListModel.findOne).toHaveBeenCalledWith({ _id: listId });
      expect(result).toBe(mockList.name);
    });
  });

  describe("getAllListsNames", () => {
    it("should get names of all lists by their IDs", async () => {
      const listsId = ["listId1", "listId2"];
      const mockLists = [
        { _id: "listId1", name: "Test List 1" },
        { _id: "listId2", name: "Test List 2" },
      ];
      const expectedNames = ["Test List 1", "Test List 2"];

      ListModel.findOne.mockResolvedValueOnce(mockLists[0]);
      ListModel.findOne.mockResolvedValueOnce(mockLists[1]);

      const result = await ListService.getAllListsNames(listsId);

      expect(ListModel.findOne).toHaveBeenNthCalledWith(1, { _id: listsId[0] });
      expect(ListModel.findOne).toHaveBeenNthCalledWith(2, { _id: listsId[1] });
      expect(result).toEqual(expectedNames);
    });
  });
});
