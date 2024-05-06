const { Schema, model } = require("mongoose");

const TodayListSchema = new Schema({
  name: { type: String, default: "Today" },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }]
});

const PlannedListSchema = new Schema({
  name: { type: String, default: "Planned" },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task", default: []  }],
  minPlannedDate: { type: String, default: Date.now },
});

const AllTasksListSchema = new Schema({
  name: { type: String, default: "Tasks" },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task", default: [] }],
});

const GeneralListsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", },
  todayList: { type: TodayListSchema },
  plannedList: { type: PlannedListSchema },
  allTasksList: { type: AllTasksListSchema },
});

module.exports = model("GeneralLists", GeneralListsSchema);
