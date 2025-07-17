import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";
import SelectDropdown from "../../components/inputs/SelectDropdown";
import SelectUsers from "../../components/inputs/SelectUsers";
import TodoListInput from "../../components/inputs/TodoListInput";
import AddAttachmentsInput from "../../components/inputs/AddAttachmentsInput";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";

const CreateTask = () => {
  const location = useLocation();
  const { taskId, taskData: stateTaskData } = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  useEffect(() => {
    if (taskId) {
      if (stateTaskData) {
        populateFormData(stateTaskData);
      } else {
        const savedData = localStorage.getItem("currentTaskData");
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            populateFormData(parsedData);
          } catch (error) {
            console.error("Error parsing saved data:", error);
            getTaskDetailsByID(taskId);
          }
        } else {
          getTaskDetailsByID(taskId);
        }
      }
    }
  }, [taskId, stateTaskData]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("currentTaskData");
    };
  }, []);

  const populateFormData = (data) => {
    setCurrentTask(data);
    setTaskData({
      title: data.title || "",
      description: data.description || "",
      priority: data.priority || "Low",
      dueDate: data.dueDate ? moment(data.dueDate).format("YYYY-MM-DD") : "",
      assignedTo: data.assignedTo
        ? data.assignedTo.map((user) =>
            typeof user === "string" ? user : user._id
          )
        : [],
      todoChecklist:
        data.todoChecklist?.map((item) =>
          typeof item === "string" ? item : item.text
        ) || [],
      attachments: data.attachments || [],
    });
  };

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: "",
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  const createTask = async () => {
    setLoading(true);
    try {
      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));

      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toDateString(),
        todoChecklist: todolist,
      });

      toast.success("Task Created Successfully");
      clearData();
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Error creating task", error);
      toast.error("Error creating task");
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
    setLoading(true);
    try {
      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));

      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toDateString(),
        todoChecklist: todolist,
      });

      toast.success("Task Updated Successfully");
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Error updating task", error);
      toast.error("Error updating task");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!taskData.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!taskData.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!taskData.dueDate) {
      setError("Due date is required.");
      return;
    }

    if (taskData.assignedTo?.length === 0) {
      setError("Task not assigned to any member");
      return;
    }

    if (taskData.todoChecklist?.length === 0) {
      setError("Add at least one todo task");
      return;
    }

    if (taskId) {
      updateTask();
    } else {
      createTask();
    }
  };

  const getTaskDetailsByID = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${API_PATHS.TASKS.GET_TASK_BY_ID}/${id}`
      );
      populateFormData(response.data);
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Error fetching task details");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      setOpenDeleteAlert(false);
      toast.success("Expense details deleted successfully");
      navigate("/admin/tasks");
    } catch (error) {
      console.error(
        "Error Deleting Expense",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Task Title
              </label>
              <input
                placeholder="Create App UI"
                className="form-input"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                placeholder="Describe task"
                className="form-input"
                rows={4}
                value={taskData.description}
                onChange={({ target }) =>
                  handleValueChange("description", target.value)
                }
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>
                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                  placeholder="Select Priority"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Due Date
                </label>
                <input
                  placeholder="Create App UI"
                  className="form-input"
                  value={taskData.dueDate ?? ""}
                  onChange={({ target }) =>
                    handleValueChange("dueDate", target.value)
                  }
                  type="date"
                />
              </div>

              <div className="col-span-12 md:col-span-3 mt-2">
                <label className="text-xs font-medium text-slate-600">
                  Assign To
                </label>
                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) =>
                    handleValueChange("assignedTo", value)
                  }
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                TODO Checklist
              </label>
              <TodoListInput
                todoList={taskData.todoChecklist}
                setTodoList={(value) =>
                  handleValueChange("todoChecklist", value)
                }
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Add Attachments
              </label>
              <AddAttachmentsInput
                attachments={taskData.attachments}
                setAttachments={(value) =>
                  handleValueChange("attachments", value)
                }
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}

            <div className="flex justify-end mt-7">
              <button
                className="add-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : taskId
                  ? "UPDATE TASK"
                  : "CREATE TASK"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={() => deleteTask()}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;
