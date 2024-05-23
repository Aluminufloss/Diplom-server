const ListModel = require("../models/List");
const GeneralListsModel = require("../models/GeneralLists");
const TaskCompletionModel = require("../models/TaskCompletion");
const TaskModel = require("../models/Task");

const filterTodayTasks = require("../utils/filterTodayTasks");
const updateTaskCompletion = require("../utils/updateTaskCompletion");
const { isDatesEqual, isFirstDateAfterSecond } = require("../utils/datesUtils");
const planeNewRepeatDate = require("../utils/planeNewRepeatDate");

const ApiError = require("../exceptions/api-error");

const listService = require("../service/list-service");
const TaskService = require("../service/task-service");

jest.mock("../models/Task");
jest.mock("../models/List");
jest.mock("../models/GeneralLists");
jest.mock("../models/TaskCompletion");
jest.mock("../service/list-service");
jest.mock("../utils/filterTodayTasks");
jest.mock("../utils/updateTaskCompletion");
jest.mock("../utils/datesUtils");
jest.mock("../utils/planeNewRepeatDate");
jest.mock("../exceptions/api-error");

describe("TaskService", () => {
  let taskService;

  beforeEach(() => {
    taskService = TaskService;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("should create a task and add it to a list", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        listId: "listId",
        priority: "high",
        plannedDate: "2024-05-23T00:00:00.000Z",
        repeatDays: [{ day: "Monday", isSelected: false }],
        category: "Test",
        status: "active",
        timeDuration: { hours: 1, minutes: 30 },
      };
      const userId = "userId";

      listService.getList.mockResolvedValue({ tasks: [], save: jest.fn() });
      TaskModel.create.mockResolvedValue([
        {
          _id: "taskId",
          ...taskData,
          save: jest.fn(),
        },
      ]);
      TaskCompletionModel.create.mockResolvedValue({ save: jest.fn() });
      GeneralListsModel.findOne.mockResolvedValue({
        plannedList: { tasks: [] },
        todayList: { tasks: [] },
        allTasksList: { tasks: [] },
        save: jest.fn(),
      });

      const result = await taskService.createTask(taskData, userId);

      console.log("result sujka", result)

      expect(TaskModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ ...taskData, listId: expect.any(Array) })
      );
      expect(result[0]).toHaveProperty("_id", taskData.taskId);
    });

    it("should throw an error if the user ID is incorrect", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        listId: [],
        priority: "high",
        plannedDate: "2024-05-23T00:00:00.000Z",
        repeatDays: [{ day: "Monday", isSelected: false }],
        category: "Test",
        status: "active",
        timeDuration: { hours: 1, minutes: 30 },
      };
      const userId = "userId";

      GeneralListsModel.findOne.mockResolvedValue(null);

      await expect(taskService.createTask(taskData, userId)).rejects.toThrow(
        expect.objectContaining({
          name: "TypeError",
          message: "Cannot read properties of null (reading 'plannedList')",
        })
      );
    });
  });

  describe("deleteTask", () => {
    it("should delete a task", async () => {
      const taskId = "taskId";
      const userId = "userId";
      const removeMock = jest.fn();
      TaskModel.findOne.mockResolvedValue({
        _id: taskId,
        listId: ["listId"],
        remove: removeMock,
      });
      TaskCompletionModel.findOne.mockResolvedValue({
        statuses: ["active"],
        remove: jest.fn(),
      });
      ListModel.updateOne.mockResolvedValue({});

      await taskService.deleteTask(taskId, userId);

      expect(TaskModel.findOne).toHaveBeenCalledWith({ _id: taskId });
      expect(removeMock).toHaveBeenCalled();
    });

    it("should throw an error if the task ID is incorrect", async () => {
      const taskId = "taskId";
      const userId = "userId";

      TaskModel.findOne.mockResolvedValue(null);

      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Задача по данному id не обнаружена",
        })
      );
    });
  });

  describe("updateTask", () => {
    it("should update a task", async () => {
      const taskData = {
        taskId: "taskId",
        title: "Updated Task",
        listId: ["listId"],
        repeatDays: [{ day: "Monday", isSelected: false }],
      };
      const userId = "userId";

      TaskModel.findById.mockResolvedValue({
        _id: taskData.taskId,
        listId: ["listId"],
        repeatDays: [{ day: "Monday", isSelected: false }],
        save: jest.fn(),
      });
      GeneralListsModel.findOne.mockResolvedValue({
        plannedList: { tasks: [] },
        todayList: { tasks: [] },
        allTasksList: { tasks: [] },
        save: jest.fn(),
      });
      TaskCompletionModel.findOne.mockResolvedValue({});
      updateTaskCompletion.mockReturnValue({ save: jest.fn() });

      const result = await taskService.updateTask(taskData, userId);

      expect(result).toHaveProperty("_id", taskData.taskId);
    });

    it("should throw an error if the task ID is incorrect", async () => {
      const taskData = {
        taskId: "taskId",
        title: "Updated Task",
      };
      const userId = "userId";

      TaskModel.findById.mockResolvedValue(null);

      await expect(taskService.updateTask(taskData, userId)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Задача по данному id не обнаружена",
        })
      );
    });
  });

  describe("getTask", () => {
    it("should return a task by ID", async () => {
      const taskId = "taskId";

      TaskModel.findById.mockResolvedValue({ _id: taskId });

      const result = await taskService.getTask(taskId);

      expect(result).toHaveProperty("_id", taskId);
    });

    it("should throw an error if the task is not found", async () => {
      const taskId = "taskId";

      TaskModel.findById.mockResolvedValue(null);

      await expect(taskService.getTask(taskId)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Задача по данному id не обнаружена",
        })
      );
    });
  });

  describe("getTodayTasks", () => {
    it("should return today's tasks for a user", async () => {
      const userId = "userId";

      GeneralListsModel.findOne.mockResolvedValue({
        plannedList: { tasks: [] },
        todayList: { tasks: [] },
        allTasksList: { tasks: [] },
        save: jest.fn(),
      });
      filterTodayTasks.mockReturnValue({
        filteredTodayTasks: [],
        tasksToDeleteFromToday: [],
      });

      const result = await taskService.getTodayTasks(userId);

      expect(result).toEqual([]);
    });

    it("should throw an error if the user ID is incorrect", async () => {
      const userId = "userId";

      GeneralListsModel.findOne.mockResolvedValue(null);

      await expect(taskService.getTodayTasks(userId)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Пользователя по данному id не обнаружено",
        })
      );
    });
  });

  describe("getPlannedTasks", () => {
    it("should return planned tasks for a user", async () => {
      const userId = "userId";

      GeneralListsModel.findOne.mockResolvedValue({
        plannedList: { tasks: [] },
        todayList: { tasks: [] },
        allTasksList: { tasks: [] },
        save: jest.fn(),
      });

      const result = await taskService.getPlannedTasks(userId);

      expect(result).toEqual([]);
    });

    it("should throw an error if the user ID is incorrect", async () => {
      const userId = "userId";

      GeneralListsModel.findOne.mockResolvedValue(null);

      await expect(taskService.getPlannedTasks(userId)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          message: "Пользователя по данному id не обнаружено",
        })
      );
    });
  });
});
