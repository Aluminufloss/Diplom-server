import ListModel from "../models/List";
import UserModel from "../models/User";
import TaskModel from "../models/Task";
import GroupModel from "../models/Group";
import GeneralListsModel from "../models/GeneralLists";

import makeGroupsFromLists from "../utils/makeGroupsFromLists";
import { isFirstDateAfterSecond, isDatesEqual } from "../utils/datesUtils";

import ListDto from "../dtos/list-dto";
import TaskDto from "../dtos/task-dto";

import ApiError from "../exceptions/api-error";

interface ICreateListData {
  name: string;
  userId: string;
  groupId?: string;
}

interface IListResponse {
  listId: string;
  title: string;
  groupId?: string;
  tasks: TaskDto[];
}

class ListService {
  async createList({ name, userId, groupId }: ICreateListData): Promise<ListDto> {
    const candidate = await UserModel.findOne({ _id: userId });

    if (!candidate) {
      throw ApiError.BadRequest(`User not found with this ID.`);
    }

    const existingList = await ListModel.findOne({ name, userId });

    if (existingList) {
      throw ApiError.BadRequest("A list with this name already exists.");
    }

    const newList = await ListModel.create({ name, userId, groupId });

    if (groupId) {
      const group = await GroupModel.findOne({ _id: groupId });

      if (!group) {
        throw ApiError.BadRequest("Group not found.");
      }

      group.lists.push(newList._id);
      await group.save();
    }

    return new ListDto(newList);
  }

  async getTasksByListId(listId: string): Promise<TaskDto[]> {
    const list = await ListModel.findOne({ _id: listId });

    if (!list) {
      throw ApiError.BadRequest("List not found.");
    }

    const resultTasks: TaskDto[] = [];

    for (const taskId of list.tasks) {
      const task = await TaskModel.findOne({ _id: taskId });

      if (!task) {
        continue; // If the task doesn't exist, skip it
      }

      if (
        isFirstDateAfterSecond(new Date(), new Date(task.plannedDate)) &&
        task.status !== "completed"
      ) {
        const newPlannedDate = planeNewRepeatDate(
          task.plannedDate,
          task.repeatDays
        );

        if (isDatesEqual(new Date(newPlannedDate), new Date(task.plannedDate))) {
          task.status = "expired";
        } else {
          task.plannedDate = newPlannedDate;
        }

        await task.save();
      }

      resultTasks.push(new TaskDto(task));
    }

    return resultTasks;
  }

  async createGeneralLists(userId: string): Promise<GeneralListsModel> {
    const generalLists = await GeneralListsModel.create({
      userId,
      todayList: { tasks: [] },
      plannedList: { tasks: [] },
      allTasksList: { tasks: [] },
    });
    return generalLists;
  }

  async deleteList(listId: string, userId: string): Promise<void> {
    const list = await ListModel.findOne({ _id: listId });

    if (!list) {
      throw ApiError.BadRequest("Invalid list ID.");
    }

    if (list.userId.toString() !== userId) {
      throw ApiError.BadRequest("Invalid user ID.");
    }

    await ListModel.deleteOne({ _id: listId });
  }

  async getList(listId: string): Promise<ListModel> {
    const list = await ListModel.findOne({ _id: listId });

    if (!list) {
      throw ApiError.BadRequest("List not found.");
    }

    return list;
  }

  async getLists(userId: string): Promise<{ lists: IListResponse[]; groups: any[] }> {
    const listsFromDB = await ListModel.find({ userId });

    const listsWithTasks: IListResponse[] = [];

    for (const list of listsFromDB) {
      const tasks = await this.getTasksByListId(list._id);

      const listObject: IListResponse = {
        listId: list._id,
        title: list.name,
        groupId: list.groupId,
        tasks,
      };

      listsWithTasks.push(listObject);
    }

    const userGroups = await GroupModel.find({ userId });

    const { lists, groups } = await makeGroupsFromLists(
      listsWithTasks,
      userGroups
    );

    return { lists, groups };
  }

  async getListName(listId: string): Promise<string> {
    const list = await ListModel.findOne({ _id: listId });

    if (!list) {
      throw ApiError.BadRequest("List not found.");
    }

    return list.name;
  }

  async getAllListsNames(listsId: string[]): Promise<string[]> {
    const listsNames: string[] = [];

    for (const listId of listsId) {
      const listName = await this.getListName(listId);
      listsNames.push(listName);
    }

    return listsNames;
  }
}

export default new ListService();
