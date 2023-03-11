export interface TaskRecord {
    author: string,
    completed: boolean,
    description: string,
    due_date: string | null,
    priority: number,
    subtasks: string[],
    task: string,
    task_group: string
}

export interface Task extends TaskRecord {
    items: ItemTask[]
}

export interface ItemTask {
    id: string,
    tid: string,
}

export interface TaskGroupRecord {
    name: string,
    tasks: string[]    
}

export interface TaskGroup extends TaskGroupRecord {
    items: ItemTask[]
}

export interface ItemTaskGroup {
    id: string,
    gid: string,
}

export interface UserData {
    uid: string,
    name: string,
    group_list: string[]
}