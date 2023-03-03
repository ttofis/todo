/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Task = "task",
	TaskGroup = "task_group",
	TaskGroups = "task_groups",
	Tasks = "tasks",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type TaskRecord = {
	task: string
	description?: string
	due_date?: IsoDateString
	completed?: boolean
	group_id: RecordIdString
	subTasks?: number
	completedSubTasks?: number
}

export type TaskGroupRecord = {
	group_name: string
	author: RecordIdString
	currentTasks?: number
	completedTasks?: number
}

export type TaskGroupsRecord = {
	group_name: string
	author: RecordIdString
}

export type TasksRecord = {
	task: string
	group_id: RecordIdString
	due_date?: IsoDateString
	completed?: boolean
	description?: string
	father?: RecordIdString
}

export type UsersRecord = {
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type TaskResponse<Texpand = unknown> = TaskRecord & BaseSystemFields<Texpand>
export type TaskGroupResponse<Texpand = unknown> = TaskGroupRecord & BaseSystemFields<Texpand>
export type TaskGroupsResponse<Texpand = unknown> = TaskGroupsRecord & BaseSystemFields<Texpand>
export type TasksResponse<Texpand = unknown> = TasksRecord & BaseSystemFields<Texpand>
export type UsersResponse = UsersRecord & AuthSystemFields

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	task: TaskRecord
	task_group: TaskGroupRecord
	task_groups: TaskGroupsRecord
	tasks: TasksRecord
	users: UsersRecord
}

export type CollectionResponses = {
	task: TaskResponse
	task_group: TaskGroupResponse
	task_groups: TaskGroupsResponse
	tasks: TasksResponse
	users: UsersResponse
}